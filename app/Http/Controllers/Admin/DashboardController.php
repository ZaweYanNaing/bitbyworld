<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $studentCount = User::where('role', 'student')->count();
        $courseCount = Course::count();
        $quizCount = Quiz::count();
        $enrollmentCount = Enrollment::count();
        $attemptCount = QuizAttempt::count();

        $enrollmentsPerCourse = Course::withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->limit(6)
            ->get()
            ->map(fn ($course) => [
                'name' => $course->title,
                'enrollments' => $course->enrollments_count,
            ]);

        $quizAttemptsPerMonth = QuizAttempt::where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get()
            ->groupBy(fn ($attempt) => $attempt->created_at->format('Y-m'))
            ->map(fn ($group, $month) => [
                'month' => $month,
                'attempts' => $group->count(),
            ])
            ->sortBy('month')
            ->values();

        $averageScores = Quiz::with(['attempts'])
            ->get()
            ->filter(fn ($quiz) => $quiz->attempts->isNotEmpty())
            ->map(function ($quiz) {
                $avg = $quiz->attempts->avg(fn ($attempt) => $attempt->total_questions > 0
                    ? ($attempt->score / $attempt->total_questions) * 100
                    : 0);

                return [
                    'name' => $quiz->title,
                    'average' => round($avg, 1),
                ];
            })
            ->sortByDesc('average')
            ->take(6)
            ->values();

        $openQuizzes = Quiz::where('is_open', true)->count();
        $closedQuizzes = Quiz::where('is_open', false)->count();

        $recentAttempts = QuizAttempt::with(['user', 'quiz.course'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($attempt) => [
                'id' => $attempt->id,
                'student_name' => $attempt->user->name,
                'quiz_title' => $attempt->quiz->title,
                'course_title' => $attempt->quiz->course->title,
                'score' => $attempt->score,
                'total_questions' => $attempt->total_questions,
                'created_at' => $attempt->created_at->toISOString(),
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'students' => $studentCount,
                'courses' => $courseCount,
                'quizzes' => $quizCount,
                'enrollments' => $enrollmentCount,
                'attempts' => $attemptCount,
                'openQuizzes' => $openQuizzes,
                'closedQuizzes' => $closedQuizzes,
            ],
            'enrollmentsPerCourse' => $enrollmentsPerCourse,
            'quizAttemptsPerMonth' => $quizAttemptsPerMonth,
            'averageScores' => $averageScores,
            'recentAttempts' => $recentAttempts,
        ]);
    }
}
