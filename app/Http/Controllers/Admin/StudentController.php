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
     * Display lists of students and courses with search, filter, and sort.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $courseFilter = $request->input('course', '');
        $statusFilter = $request->input('status', '');
        $sortBy = $request->input('sort', 'name');
        $sortDir = $request->input('direction', 'asc');

        $query = User::where('role', 'student')
            ->with(['enrollments.course']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($courseFilter) {
            $query->whereHas('enrollments', fn ($q) => $q->where('course_id', $courseFilter));
        }

        if ($statusFilter === 'enrolled') {
            $query->has('enrollments');
        } elseif ($statusFilter === 'not_enrolled') {
            $query->doesntHave('enrollments');
        }

        $allowedSorts = ['name', 'email', 'created_at'];
        if (! in_array($sortBy, $allowedSorts)) {
            $sortBy = 'name';
        }
        $sortDir = $sortDir === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'name' || $sortBy === 'email' || $sortBy === 'created_at') {
            $query->orderBy($sortBy, $sortDir);
        }

        $students = $query->get();

        if ($sortBy === 'enrollments') {
            $students = $students->sortBy(
                fn ($student) => $student->enrollments->count(),
                SORT_REGULAR,
                $sortDir === 'desc'
            )->values();
        }

        $courses = Course::all();

        return Inertia::render('admin/students', [
            'students' => $students,
            'courses' => $courses,
            'filters' => [
                'search' => $search,
                'course' => $courseFilter,
                'status' => $statusFilter,
                'sort' => $sortBy,
                'direction' => $sortDir,
            ],
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
