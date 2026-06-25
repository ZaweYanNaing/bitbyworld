<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CourseController extends Controller
{
    /**
     * Display a listing of courses for management.
     */
    public function index()
    {
        $courses = Course::with('lessons.images', 'lessons.audios')->withCount('enrollments')->get();

        return Inertia::render('admin/courses', [
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created course.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail_file' => 'nullable|image|max:5120', // max 5MB
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail_file')) {
            $thumbnailPath = $request->file('thumbnail_file')->store('courses', 'r2');
        }

        Course::create([
            'title' => $request->title,
            'description' => $request->description,
            'thumbnail_path' => $thumbnailPath,
        ]);

        return back()->with('success', 'Course created successfully!');
    }

    /**
     * Update the specified course.
     */
    public function update(Request $request, Course $course)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail_file' => 'nullable|image|max:5120',
        ]);

        $data = [
            'title' => $request->title,
            'description' => $request->description,
        ];

        if ($request->hasFile('thumbnail_file')) {
            // Delete old thumbnail if exists
            if ($course->thumbnail_path) {
                Storage::disk('r2')->delete($course->thumbnail_path);
            }
            $data['thumbnail_path'] = $request->file('thumbnail_file')->store('courses', 'r2');
        }

        $course->update($data);

        return back()->with('success', 'Course updated successfully!');
    }

    /**
     * Remove the specified course.
     */
    public function destroy(Course $course)
    {
        // Delete uploaded files
        if ($course->thumbnail_path) {
            Storage::disk('r2')->delete($course->thumbnail_path);
        }

        $course->delete();

        return back()->with('success', 'Course deleted successfully!');
    }
}
