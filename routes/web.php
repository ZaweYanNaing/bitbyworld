<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\LessonController as AdminLessonController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Authenticated & Verified Routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dynamic Dashboard Routing
    Route::get('dashboard', function () {
        $user = auth()->user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.courses.index');
        }

        // Student Dashboard: Load only enrolled courses with their lessons
        $courses = $user->courses()->with('lessons')->get();
        $completedLessonIds = $user->lessonCompletions()->pluck('lesson_id')->toArray();

        return Inertia::render('dashboard', [
            'courses' => $courses,
            'completedLessonIds' => $completedLessonIds,
        ]);
    })->name('dashboard');

    // Student Course Player & Actions
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::post('lessons/{lesson}/complete', [CourseController::class, 'completeLesson'])->name('lessons.complete');
});

// Admin Only Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    // Course Management (Note: update uses POST due to multipart/form-data with file uploads)
    Route::get('courses', [AdminCourseController::class, 'index'])->name('admin.courses.index');
    Route::post('courses', [AdminCourseController::class, 'store'])->name('admin.courses.store');
    Route::post('courses/{course}', [AdminCourseController::class, 'update'])->name('admin.courses.update');
    Route::delete('courses/{course}', [AdminCourseController::class, 'destroy'])->name('admin.courses.destroy');

    // Lesson Management (Note: update uses POST due to file uploads)
    Route::post('courses/{course}/lessons', [AdminLessonController::class, 'store'])->name('admin.lessons.store');
    Route::post('lessons/{lesson}', [AdminLessonController::class, 'update'])->name('admin.lessons.update');
    Route::delete('lessons/{lesson}', [AdminLessonController::class, 'destroy'])->name('admin.lessons.destroy');

    // Lesson Media Management
    Route::patch('lesson-audios/{audio}', [AdminLessonController::class, 'updateAudioTitle'])->name('admin.lesson-audios.update-title');
    Route::delete('lesson-audios/{audio}', [AdminLessonController::class, 'destroyAudio'])->name('admin.lesson-audios.destroy');
    Route::delete('lesson-images/{image}', [AdminLessonController::class, 'destroyImage'])->name('admin.lesson-images.destroy');

    // Student Management
    Route::get('students', [AdminStudentController::class, 'index'])->name('admin.students.index');
    Route::put('students/{student}', [AdminStudentController::class, 'update'])->name('admin.students.update');
    Route::delete('students/{student}', [AdminStudentController::class, 'destroy'])->name('admin.students.destroy');
    Route::post('students/{student}/enroll', [AdminStudentController::class, 'enrollStudent'])->name('admin.students.enroll');
    Route::post('students/{student}/unenroll', [AdminStudentController::class, 'unenrollStudent'])->name('admin.students.unenroll');
});

require __DIR__.'/settings.php';
