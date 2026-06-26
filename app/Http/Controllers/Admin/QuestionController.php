<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    /**
     * Store a newly created question in the quiz.
     */
    public function store(Request $request, Quiz $quiz)
    {
        $request->validate([
            'question_text' => 'required|string',
            'image_file'    => 'nullable|image|max:5120',
            'options'       => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct'  => 'required|boolean',
        ]);

        $sortOrder = $quiz->questions()->count() + 1;

        $imagePath = null;
        if ($request->hasFile('image_file')) {
            $imagePath = $request->file('image_file')->store('courses', 'r2');
        }

        $question = $quiz->questions()->create([
            'question_text' => $request->question_text,
            'image_path'    => $imagePath,
            'sort_order'    => $sortOrder,
        ]);

        foreach ($request->options as $opt) {
            $question->options()->create([
                'option_text' => $opt['option_text'],
                'is_correct'  => $opt['is_correct'],
            ]);
        }

        return back()->with('success', 'Question added successfully! 🌟');
    }

    /**
     * Update the specified question.
     * Route: POST /admin/questions/{question} with _method=PUT (multipart/form-data support)
     */
    public function update(Request $request, QuizQuestion $question)
    {
        $request->validate([
            'question_text' => 'required|string',
            'image_file'    => 'nullable|image|max:5120',
            'options'       => 'required|array|min:2',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct'  => 'required|boolean',
        ]);

        $data = ['question_text' => $request->question_text];

        // Replace image if a new one is uploaded
        if ($request->hasFile('image_file')) {
            if ($question->image_path) {
                Storage::disk('r2')->delete($question->image_path);
            }
            $data['image_path'] = $request->file('image_file')->store('courses', 'r2');
        }

        // Allow explicitly clearing the image
        if ($request->input('remove_image') === '1' && $question->image_path) {
            Storage::disk('r2')->delete($question->image_path);
            $data['image_path'] = null;
        }

        $question->update($data);

        // Re-create options
        $question->options()->delete();
        foreach ($request->options as $opt) {
            $question->options()->create([
                'option_text' => $opt['option_text'],
                'is_correct'  => $opt['is_correct'],
            ]);
        }

        return back()->with('success', 'Question updated successfully!');
    }

    /**
     * Remove the specified question from storage.
     */
    public function destroy(QuizQuestion $question)
    {
        // Delete associated image from R2 if present
        if ($question->image_path) {
            Storage::disk('r2')->delete($question->image_path);
        }

        $question->delete();

        return back()->with('success', 'Question deleted successfully.');
    }
}
