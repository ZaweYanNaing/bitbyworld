<?php

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonImage;
use App\Models\LessonAudio;
use App\Models\LessonCompletion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('non-admins cannot access admin course list', function () {
    $student = User::factory()->create(['role' => 'student']);

    $response = $this
        ->actingAs($student)
        ->get('/admin/courses');

    $response->assertStatus(403);
});

test('admins can access admin course list', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->get('/admin/courses');

    $response->assertOk();
});

test('admins can create a new course and add a lesson with multiple files', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);

    // 1. Create Course
    $response = $this
        ->actingAs($admin)
        ->post('/admin/courses', [
            'title' => 'Space Adventure 🚀',
            'description' => 'A trip to the stars!',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $course = Course::where('title', 'Space Adventure 🚀')->first();
    expect($course)->not->toBeNull();

    // 2. Add Lesson with multiple images and audios
    $audioFile1 = UploadedFile::fake()->create('intro.mp3', 100);
    $audioFile2 = UploadedFile::fake()->create('facts.mp3', 100);
    $imageFile1 = UploadedFile::fake()->image('universe.jpg');
    $imageFile2 = UploadedFile::fake()->image('planets.png');

    $response = $this
        ->actingAs($admin)
        ->post("/admin/courses/{$course->id}/lessons", [
            'title' => 'Lesson 1: The Solar System 🪐',
            'description' => 'Meet our neighbor planets.',
            'youtube_link' => 'https://www.youtube.com/watch?v=F2hc2FLOd5M',
            'images' => [$imageFile1, $imageFile2],
            'audio_files' => [$audioFile1, $audioFile2],
            'audio_titles' => ['Introduction Track 🎧', 'Fun Facts Track 🪐'],
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('lessons', [
        'course_id' => $course->id,
        'title' => 'Lesson 1: The Solar System 🪐',
    ]);

    $lesson = Lesson::where('title', 'Lesson 1: The Solar System 🪐')->first();
    expect($lesson->images)->toHaveCount(2);
    expect($lesson->audios)->toHaveCount(2);

    // Verify database entries
    $this->assertDatabaseHas('lesson_audios', [
        'lesson_id' => $lesson->id,
        'title' => 'Introduction Track 🎧',
    ]);
    $this->assertDatabaseHas('lesson_audios', [
        'lesson_id' => $lesson->id,
        'title' => 'Fun Facts Track 🪐',
    ]);

    // Verify storage files
    foreach ($lesson->images as $img) {
        Storage::disk('public')->assertExists($img->image_path);
    }
    foreach ($lesson->audios as $aud) {
        Storage::disk('public')->assertExists($aud->audio_path);
    }
});

test('admins can rename an audio title and delete individual assets', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'admin']);
    $course = Course::create(['title' => 'Art Quest 🎨', 'description' => 'Paint colorfully!']);
    $lesson = Lesson::create(['course_id' => $course->id, 'title' => 'Mix Colors']);

    // Seed dummy image and audio
    $img = LessonImage::create([
        'lesson_id' => $lesson->id,
        'image_path' => 'courses/sample_img.jpg',
    ]);
    $aud = LessonAudio::create([
        'lesson_id' => $lesson->id,
        'title' => 'Old Title',
        'audio_path' => 'courses/sample_aud.mp3',
    ]);

    Storage::disk('public')->put('courses/sample_img.jpg', 'img_content');
    Storage::disk('public')->put('courses/sample_aud.mp3', 'aud_content');

    // 1. Rename audio title
    $response = $this
        ->actingAs($admin)
        ->patch("/admin/lesson-audios/{$aud->id}", [
            'title' => 'Cool New Title 🎵',
        ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('lesson_audios', [
        'id' => $aud->id,
        'title' => 'Cool New Title 🎵',
    ]);

    // 2. Delete single audio
    $response = $this
        ->actingAs($admin)
        ->delete("/admin/lesson-audios/{$aud->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('lesson_audios', ['id' => $aud->id]);
    Storage::disk('public')->assertMissing('courses/sample_aud.mp3');

    // 3. Delete single image
    $response = $this
        ->actingAs($admin)
        ->delete("/admin/lesson-images/{img->id}"); // Oops, we should make sure we interpolate it correctly
    $response = $this
        ->actingAs($admin)
        ->delete("/admin/lesson-images/{$img->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('lesson_images', ['id' => $img->id]);
    Storage::disk('public')->assertMissing('courses/sample_img.jpg');
});

test('students see only enrolled courses and can complete lessons', function () {
    $student = User::factory()->create(['role' => 'student']);
    
    $courseEnrolled = Course::create([
        'title' => 'Coding Quest 💻',
        'description' => 'Learn to code robots!',
    ]);

    $courseNotEnrolled = Course::create([
        'title' => 'Mystery World 🔍',
        'description' => 'Solve math riddles!',
    ]);

    $lesson = Lesson::create([
        'course_id' => $courseEnrolled->id,
        'title' => 'Intro to Code 🤖',
    ]);

    // Enroll in the first course only
    $student->courses()->attach($courseEnrolled->id);

    // 1. Visit dashboard (should only display enrolled course)
    $response = $this
        ->actingAs($student)
        ->get('/dashboard');
    
    $response->assertOk();

    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('dashboard')
        ->has('courses', 1)
        ->where('courses.0.title', 'Coding Quest 💻')
    );

    // 2. View player page
    $response = $this
        ->actingAs($student)
        ->get("/courses/{$courseEnrolled->id}");
        
    $response->assertOk();

    // 3. Complete lesson
    $response = $this
        ->actingAs($student)
        ->post("/lessons/{$lesson->id}/complete");

    $response->assertRedirect();
    
    $this->assertDatabaseHas('lesson_completions', [
        'user_id' => $student->id,
        'lesson_id' => $lesson->id,
    ]);
});
