<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'youtube_link',
        'sort_order',
    ];

    /**
     * Get the course that owns this lesson.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get images for this lesson.
     */
    public function images()
    {
        return $this->hasMany(LessonImage::class);
    }

    /**
     * Get audios for this lesson.
     */
    public function audios()
    {
        return $this->hasMany(LessonAudio::class);
    }

    /**
     * Get completions for this lesson.
     */
    public function completions()
    {
        return $this->hasMany(LessonCompletion::class);
    }

    /**
     * Check if a specific user has completed this lesson.
     */
    public function isCompletedBy(User $user): bool
    {
        return $this->completions()->where('user_id', $user->id)->exists();
    }
}
