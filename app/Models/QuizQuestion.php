<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = [
        'quiz_id',
        'question_text',
        'image_path',
        'sort_order',
    ];

    /**
     * Get the quiz that owns this question.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the options for the question.
     */
    public function options()
    {
        return $this->hasMany(QuizOption::class, 'question_id');
    }
}
