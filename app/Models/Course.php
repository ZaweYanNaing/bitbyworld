<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'thumbnail_path',
    ];

    /**
     * Get lessons in the course.
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Get enrollments for the course.
     */
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Get users enrolled in this course.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'enrollments');
    }

    /**
     * Get quizzes in this course.
     */
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
