<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonImage;
use App\Models\LessonAudio;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@bitbyworld.com'],
            [
                'name' => 'Professor Star 🌟',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. Create Student User
        $student = User::updateOrCreate(
            ['email' => 'student@bitbyworld.com'],
            [
                'name' => 'Leo the Explorer 🎒',
                'password' => Hash::make('password'),
                'role' => 'student',
            ]
        );

        // 3. Setup Storage directory
        Storage::disk('public')->makeDirectory('courses');

        // Tiny silent MP3 file base64
        $silentMp3 = base64_decode(
            '//uQxAAAAAAAAAAAAAAAAAAAAAAAQ29udmVydGVkIGJ5IEF1ZGlvT24xLmNvbQ' .
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' .
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' .
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' .
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' .
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' .
            '//uQxAMAAAMAA0gAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            '//uQxAsAAAMAA0gAAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' .
            'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
        );

        Storage::disk('public')->put('courses/lesson_silent.mp3', $silentMp3);

        // SVGs for Thumbnails
        $badges = [
            'science' => '<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#E1F5FE"/><text x="50" y="60" font-size="40" text-anchor="middle">🧪</text></svg>',
            'coding' => '<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#E8F5E9"/><text x="50" y="60" font-size="40" text-anchor="middle">💻</text></svg>',
            'math' => '<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#FFFDE7"/><text x="50" y="60" font-size="40" text-anchor="middle">🪄</text></svg>',
            'art' => '<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#FCE4EC"/><text x="50" y="60" font-size="40" text-anchor="middle">🎨</text></svg>',
        ];

        Storage::disk('public')->put('courses/science.svg', $badges['science']);
        Storage::disk('public')->put('courses/coding.svg', $badges['coding']);
        Storage::disk('public')->put('courses/math.svg', $badges['math']);
        Storage::disk('public')->put('courses/art.svg', $badges['art']);

        // 4. Seed Course Data
        $c1 = Course::updateOrCreate(
            ['title' => 'Science Quest: Exploring Space! 🚀'],
            [
                'description' => 'Learn all about the planets, stars, and the moon in this galactic adventure!',
                'thumbnail_path' => 'courses/science.svg',
            ]
        );

        $c2 = Course::updateOrCreate(
            ['title' => 'Coding Adventure: Code a Robot! 🤖'],
            [
                'description' => 'Help robot Robo find his way home by writing short coding instructions!',
                'thumbnail_path' => 'courses/coding.svg',
            ]
        );

        $c3 = Course::updateOrCreate(
            ['title' => 'Math Magic: Number Wizards! 🪄'],
            [
                'description' => 'Learn addition and subtraction with matching wizard games and number riddles!',
                'thumbnail_path' => 'courses/math.svg',
            ]
        );

        $c4 = Course::updateOrCreate(
            ['title' => 'Art Studio: Paint the World! 🎨'],
            [
                'description' => 'Mix color colors, paint beautiful landscapes, and discover famous painters!',
                'thumbnail_path' => 'courses/art.svg',
            ]
        );

        // 5. Seed Lessons for Space Course
        $l1 = Lesson::updateOrCreate(
            ['course_id' => $c1->id, 'title' => 'The Solar System 🪐'],
            [
                'description' => 'Meet our solar neighborhood of 8 planets orbiting a massive blazing star!',
                'youtube_link' => 'https://www.youtube.com/watch?v=F2hc2FLOd5M',
                'sort_order' => 1,
            ]
        );
        $l1->audios()->delete();
        $l1->images()->delete();
        $l1->audios()->create(['title' => 'Introduction to the Solar System 🪐', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l1->audios()->create(['title' => 'Fun Planet Facts! ☄️', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l1->images()->create(['image_path' => 'courses/science.svg']);
        $l1->images()->create(['image_path' => 'courses/math.svg']); // fallback visual indicator

        $l2 = Lesson::updateOrCreate(
            ['course_id' => $c1->id, 'title' => 'Bouncing on the Moon 🌕'],
            [
                'description' => 'Did you know gravity is weaker on the moon? Learn how astronauts bounce around!',
                'youtube_link' => 'https://www.youtube.com/watch?v=qYzFzV5s_88',
                'sort_order' => 2,
            ]
        );
        $l2->audios()->delete();
        $l2->images()->delete();
        $l2->audios()->create(['title' => 'Moon Landing Narration 🚀', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l2->images()->create(['image_path' => 'courses/science.svg']);

        // 6. Seed Lessons for Coding Course
        $l3 = Lesson::updateOrCreate(
            ['course_id' => $c2->id, 'title' => 'What is Code? 💻'],
            [
                'description' => 'Computers don\'t speak English! Learn how to write recipes computers can understand.',
                'youtube_link' => 'https://www.youtube.com/watch?v=V7G8_0-B1kM',
                'sort_order' => 1,
            ]
        );
        $l3->audios()->delete();
        $l3->images()->delete();
        $l3->audios()->create(['title' => 'Coding Introduction 💻', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l3->audios()->create(['title' => 'Robo and the Recipe 🤖', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l3->images()->create(['image_path' => 'courses/coding.svg']);

        $l4 = Lesson::updateOrCreate(
            ['course_id' => $c2->id, 'title' => 'Bouncing Loops 🔁'],
            [
                'description' => 'Learn how to make code repeat instructions over and over without repeating yourself!',
                'youtube_link' => 'https://www.youtube.com/watch?v=y9F5I6K3Uo0',
                'sort_order' => 2,
            ]
        );
        $l4->audios()->delete();
        $l4->images()->delete();
        $l4->audios()->create(['title' => 'Loops Song! 🔁', 'audio_path' => 'courses/lesson_silent.mp3']);
        $l4->images()->create(['image_path' => 'courses/coding.svg']);

        // 7. Enroll Student in both Space Quest and Coding Adventure
        Enrollment::updateOrCreate(['user_id' => $student->id, 'course_id' => $c1->id]);
        Enrollment::updateOrCreate(['user_id' => $student->id, 'course_id' => $c2->id]);
    }
}
