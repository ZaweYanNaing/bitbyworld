<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizRetakeGrant;
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

        // Load quizzes and their questions/options (students only see open quizzes)
        $quizzesQuery = $course->quizzes()->with('questions.options');
        if ($user->role !== 'admin') {
            $quizzesQuery->where('is_open', true);
        }
        $quizzes = $quizzesQuery->get();

        // Get the latest attempt for each quiz by the current user
        $quizAttempts = $user->quizAttempts()
            ->whereIn('quiz_id', $quizzes->pluck('id'))
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique('quiz_id')
            ->values();

        // Check for pending retake grants
        $retakeGrants = QuizRetakeGrant::where('user_id', $user->id)
            ->whereIn('quiz_id', $quizzes->pluck('id'))
            ->whereNull('used_at')
            ->pluck('quiz_id')
            ->toArray();

        return Inertia::render('courses/show', [
            'course' => $course,
            'lessons' => $lessons,
            'completedLessonIds' => $completedLessonIds,
            'quizzes' => $quizzes,
            'quizAttempts' => $quizAttempts,
            'retakeGrantQuizIds' => $retakeGrants,
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

    /**
     * Submit answers for a quiz.
     */
    public function submitQuiz(Request $request, Quiz $quiz)
    {
        $user = Auth::user();

        // Verify student is enrolled in the quiz's course
        $isEnrolled = $user->courses()->where('course_id', $quiz->course_id)->exists();
        if (!$isEnrolled && $user->role !== 'admin') {
            abort(403, 'You are not enrolled in this adventure!');
        }

        // Students can only submit when quiz is open
        if ($user->role !== 'admin' && ! $quiz->is_open) {
            abort(403, 'This quiz is not open for taking.');
        }

        $existingAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quiz->id)
            ->exists();

        if ($existingAttempt && $user->role !== 'admin') {
            $retakeGrant = QuizRetakeGrant::where('user_id', $user->id)
                ->where('quiz_id', $quiz->id)
                ->whereNull('used_at')
                ->first();

            if (! $retakeGrant) {
                abort(403, 'You have already taken this quiz. Ask your teacher for another attempt.');
            }

            $retakeGrant->update(['used_at' => now()]);
        }

        $request->validate([
            'answers' => 'required|array',
        ]);

        $answers = $request->input('answers');
        
        $questions = $quiz->questions()->with('options')->get();
        $score = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $question) {
            $selectedOptionId = $answers[$question->id] ?? null;
            if ($selectedOptionId) {
                $correctOption = $question->options->where('is_correct', true)->first();
                if ($correctOption && $correctOption->id == $selectedOptionId) {
                    $score++;
                }
            }
        }

        QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'answers' => $answers,
        ]);

        return back()->with('success', "Quiz completed! You scored {$score} out of {$totalQuestions}! 🎉");
    }
}
