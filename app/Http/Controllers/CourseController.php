<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Show a course detail and lesson player.
     */
    public function show(Course $course)
    {
        $user = Auth::user();
        
        // Ensure student is enrolled before accessing
        $isEnrolled = $user->courses()->where('course_id', $course->id)->exists();
        if (!$isEnrolled && $user->role !== 'admin') {
            abort(403, 'You are not enrolled in this adventure!');
        }

        $lessons = $course->lessons()->with(['images', 'audios'])->get();
        $completedLessonIds = $user->lessonCompletions()
            ->whereIn('lesson_id', $lessons->pluck('id'))
            ->pluck('lesson_id')
            ->toArray();

        return Inertia::render('courses/show', [
            'course' => $course,
            'lessons' => $lessons,
            'completedLessonIds' => $completedLessonIds,
        ]);
    }

    /**
     * Mark a specific lesson as completed.
     */
    public function completeLesson(Lesson $lesson)
    {
        $user = Auth::user();

        // Verify student is enrolled in the lesson's course
        $isEnrolled = $user->courses()->where('course_id', $lesson->course_id)->exists();
        if (!$isEnrolled && $user->role !== 'admin') {
            abort(403, 'You are not enrolled in this adventure!');
        }

        LessonCompletion::firstOrCreate([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ]);

        return back()->with('success', 'Lesson completed! Good job! 🌟');
    }
}
