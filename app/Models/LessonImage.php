<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'image_path',
    ];

    /**
     * Get the lesson that owns this image.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
