<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'description',
    ];

    /**
     * Get the course that owns this quiz.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the questions for the quiz.
     */
    public function questions()
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Get the attempts for the quiz.
     */
    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
