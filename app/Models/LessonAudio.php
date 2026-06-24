<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonAudio extends Model
{
    use HasFactory;

    protected $table = 'lesson_audios';

    protected $fillable = [
        'lesson_id',
        'title',
        'audio_path',
    ];

    /**
     * Get the lesson that owns this audio.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
