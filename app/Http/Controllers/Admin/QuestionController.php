<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Store a newly created question in the quiz.
     */
    public function store(Request $request, Quiz $quiz)
    {
        $request->validate([
            'question_text' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $sortOrder = $quiz->questions()->count() + 1;

        $question = $quiz->questions()->create([
            'question_text' => $request->question_text,
            'sort_order' => $sortOrder,
        ]);

        foreach ($request->options as $opt) {
            $question->options()->create([
                'option_text' => $opt['option_text'],
                'is_correct' => $opt['is_correct'],
            ]);
        }

        return back()->with('success', 'Question added successfully! 🌟');
    }

    /**
     * Update the specified question.
     */
    public function update(Request $request, QuizQuestion $question)
    {
        $request->validate([
            'question_text' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $question->update([
            'question_text' => $request->question_text,
        ]);

        // Re-create options
        $question->options()->delete();
        foreach ($request->options as $opt) {
            $question->options()->create([
                'option_text' => $opt['option_text'],
                'is_correct' => $opt['is_correct'],
            ]);
        }

        return back()->with('success', 'Question updated successfully!');
    }

    /**
     * Remove the specified question from storage.
     */
    public function destroy(QuizQuestion $question)
    {
        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }
}
