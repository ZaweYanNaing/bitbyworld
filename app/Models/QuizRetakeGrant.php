<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizRetakeGrant extends Model
{
    protected $fillable = [
        'user_id',
        'quiz_id',
        'granted_by',
        'used_at',
    ];

    protected $casts = [
        'used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function grantedBy()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    public function isAvailable(): bool
    {
        return $this->used_at === null;
    }
}
