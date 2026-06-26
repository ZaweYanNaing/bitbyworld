<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_id',
        'score',
        'total_questions',
        'answers',
    ];

    protected $casts = [
        'answers' => 'array',
    ];

    /**
     * Get the user that made the attempt.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the quiz that was attempted.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
