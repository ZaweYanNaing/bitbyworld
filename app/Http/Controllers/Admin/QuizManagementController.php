<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizRetakeGrant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizManagementController extends Controller
{
    public function toggleOpen(Quiz $quiz)
    {
        $quiz->update(['is_open' => ! $quiz->is_open]);

        $status = $quiz->is_open ? 'opened' : 'closed';

        return back()->with('success', "Quiz {$status} successfully!");
    }

    public function results(Quiz $quiz)
    {
        $quiz->load(['course', 'questions.options']);

        $attempts = QuizAttempt::with('user')
            ->where('quiz_id', $quiz->id)
            ->latest()
            ->get()
            ->map(fn ($attempt) => [
                'id' => $attempt->id,
                'user_id' => $attempt->user_id,
                'student_name' => $attempt->user->name,
                'student_email' => $attempt->user->email,
                'score' => $attempt->score,
                'total_questions' => $attempt->total_questions,
                'percentage' => $attempt->total_questions > 0
                    ? round(($attempt->score / $attempt->total_questions) * 100, 1)
                    : 0,
                'answers' => $attempt->answers,
                'created_at' => $attempt->created_at->toISOString(),
            ]);

        $enrolledStudents = User::where('role', 'student')
            ->whereHas('courses', fn ($q) => $q->where('courses.id', $quiz->course_id))
            ->with(['quizAttempts' => fn ($q) => $q->where('quiz_id', $quiz->id)])
            ->get()
            ->map(function ($student) use ($quiz) {
                $latestAttempt = $student->quizAttempts->sortByDesc('created_at')->first();
                $hasPendingGrant = QuizRetakeGrant::where('user_id', $student->id)
                    ->where('quiz_id', $quiz->id)
                    ->whereNull('used_at')
                    ->exists();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'has_attempted' => $latestAttempt !== null,
                    'latest_score' => $latestAttempt?->score,
                    'latest_total' => $latestAttempt?->total_questions,
                    'has_pending_grant' => $hasPendingGrant,
                ];
            });

        return Inertia::render('admin/quiz-results', [
            'quiz' => $quiz,
            'attempts' => $attempts,
            'enrolledStudents' => $enrolledStudents,
        ]);
    }

    public function grantRetake(Request $request, Quiz $quiz)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $student = User::where('id', $request->user_id)->where('role', 'student')->firstOrFail();

        $hasAttempt = QuizAttempt::where('user_id', $student->id)
            ->where('quiz_id', $quiz->id)
            ->exists();

        if (! $hasAttempt) {
            return back()->with('error', 'This student has not taken the quiz yet.');
        }

        $hasPendingGrant = QuizRetakeGrant::where('user_id', $student->id)
            ->where('quiz_id', $quiz->id)
            ->whereNull('used_at')
            ->exists();

        if ($hasPendingGrant) {
            return back()->with('error', 'This student already has a pending retake grant.');
        }

        QuizRetakeGrant::create([
            'user_id' => $student->id,
            'quiz_id' => $quiz->id,
            'granted_by' => auth()->id(),
        ]);

        return back()->with('success', "Retake granted to {$student->name}!");
    }
}
