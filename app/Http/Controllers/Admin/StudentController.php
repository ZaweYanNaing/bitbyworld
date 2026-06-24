<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display lists of students and courses.
     */
    public function index()
    {
        $students = User::where('role', 'student')
            ->with(['enrollments.course'])
            ->get();

        $courses = Course::all();

        return Inertia::render('admin/students', [
            'students' => $students,
            'courses' => $courses,
        ]);
    }

    /**
     * Update the student profile details.
     */
    public function update(Request $request, User $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $student->id,
        ]);

        $student->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return back()->with('success', 'Student updated successfully!');
    }

    /**
     * Remove the student account.
     */
    public function destroy(User $student)
    {
        if ($student->role === 'admin') {
            abort(403, 'Cannot delete an admin user!');
        }

        $student->delete();

        return back()->with('success', 'Student deleted successfully!');
    }

    /**
     * Enroll a student in a course.
     */
    public function enrollStudent(Request $request, User $student)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        Enrollment::firstOrCreate([
            'user_id' => $student->id,
            'course_id' => $request->course_id,
        ]);

        return back()->with('success', 'Student enrolled successfully!');
    }

    /**
     * Unenroll a student from a course.
     */
    public function unenrollStudent(Request $request, User $student)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        Enrollment::where('user_id', $student->id)
            ->where('course_id', $request->course_id)
            ->delete();

        return back()->with('success', 'Student unenrolled successfully!');
    }
}
