import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { 
    Users, Plus, Trash2, Edit2, ChevronDown, ChevronUp, 
    BookOpen, Award, CheckCircle2, X, AlertTriangle 
} from 'lucide-react';

interface Course {
    id: number;
    title: string;
}

interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    is_completed: boolean;
    completed_at: string | null;
    course: Course;
}

interface Student {
    id: number;
    name: string;
    email: string;
    enrollments: Enrollment[];
}

interface AdminStudentsProps {
    students: Student[];
    courses: Course[];
}

export default function Students({ students = [], courses = [] }: AdminStudentsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Students', href: '/admin/students' },
    ];

    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Selected course for enrollment per student
    const [selectedCourseEnroll, setSelectedCourseEnroll] = useState<Record<number, string>>({});

    // Profile form
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
    });

    const toggleExpand = (studentId: number) => {
        setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    const openEditModal = (student: Student) => {
        clearErrors();
        setEditingStudent(student);
        setData({
            name: student.name,
            email: student.email,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;

        put(`/admin/students/${editingStudent.id}`, {
            onSuccess: () => {
                closeEditModal();
                reset();
            }
        });
    };

    const handleDeleteStudent = (studentId: number) => {
        if (confirm('Are you sure you want to delete this student? All their enrollments and progress metrics will be permanently deleted.')) {
            router.delete(`/admin/students/${studentId}`);
        }
    };

    const handleEnrollStudent = (studentId: number) => {
        const courseId = selectedCourseEnroll[studentId];
        if (!courseId) {
            alert('Please select a course to enroll.');
            return;
        }

        router.post(`/admin/students/${studentId}/enroll`, {
            course_id: parseInt(courseId),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Clear selection
                setSelectedCourseEnroll(prev => ({
                    ...prev,
                    [studentId]: '',
                }));
            }
        });
    };

    const handleUnenrollStudent = (studentId: number, courseId: number) => {
        if (confirm('Are you sure you want to unenroll the student from this course? This deletes progress data for this course.')) {
            router.post(`/admin/students/${studentId}/unenroll`, {
                course_id: courseId,
            }, {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Students" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-slate-50 dark:from-neutral-900 dark:to-neutral-950 font-sans">
                
                {/* Header Section */}
                <div className="border-b border-slate-100 dark:border-neutral-800 pb-4">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-200">
                        Student Account & Dashboard Manager 🎒
                    </h1>
                    <p className="text-slate-500 dark:text-neutral-400 text-sm">
                        Track learning achievements, adjust dashboards, and manage course enrollments.
                    </p>
                </div>

                {/* Students List Container */}
                {students.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-neutral-800">
                        <Users className="size-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-extrabold text-slate-700 dark:text-neutral-300 text-lg">No student accounts registered</h3>
                        <p className="text-slate-400 dark:text-neutral-500 text-sm mt-1">Students can register themselves using the sign-up page.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {students.map(student => {
                            const enrollCount = student.enrollments.length;
                            const completeCount = student.enrollments.filter(e => e.is_completed).length;
                            const progressPercent = enrollCount > 0 ? Math.round((completeCount / enrollCount) * 100) : 0;
                            const isExpanded = expandedStudentId === student.id;

                            // Courses they are NOT enrolled in
                            const enrolledCourseIds = student.enrollments.map(e => e.course_id);
                            const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));

                            return (
                                <div 
                                    key={student.id}
                                    className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-sm overflow-hidden"
                                >
                                    {/* Main Row Info */}
                                    <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold text-indigo-500 shrink-0">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 dark:text-neutral-200">
                                                    {student.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 dark:text-neutral-500 font-bold">
                                                    {student.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Metrics */}
                                        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                                            <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                                                <BookOpen className="size-4 text-sky-500" />
                                                <span className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                    {enrollCount} Enrolled
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                                                <Award className="size-4 text-amber-500" />
                                                <span className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                    {completeCount} Completed ({progressPercent}%)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                            <button
                                                onClick={() => openEditModal(student)}
                                                className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-600 dark:text-neutral-400 flex items-center justify-center active:scale-95 transition-all"
                                                title="Edit Student Profile"
                                            >
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="size-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center active:scale-95 transition-all"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleExpand(student.id)}
                                                className="size-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center active:scale-95 transition-all"
                                                title="View Enrollments"
                                            >
                                                {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Detail Panel (Enrollment Controls) */}
                                    {isExpanded && (
                                        <div className="bg-slate-50/50 dark:bg-neutral-950/20 border-t border-slate-50 dark:border-neutral-800/80 p-5 flex flex-col gap-5">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-700 dark:text-neutral-300 mb-2">Enrollment Adventure Map</h4>
                                                
                                                {student.enrollments.length === 0 ? (
                                                    <p className="text-xs text-slate-400">This student is not enrolled in any courses.</p>
                                                ) : (
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {student.enrollments.map(enroll => (
                                                            <div 
                                                                key={enroll.id}
                                                                className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-2xl p-3.5 flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {enroll.is_completed ? (
                                                                        <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                                                                    ) : (
                                                                        <div className="size-5 rounded-full border-2 border-slate-200" />
                                                                    )}
                                                                    <span className="text-xs font-black text-slate-700 dark:text-neutral-200 line-clamp-1">
                                                                        {enroll.course.title}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleUnenrollStudent(student.id, enroll.course_id)}
                                                                    className="text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Manual Course Enrollment control */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-slate-100 dark:border-neutral-800/80 pt-4">
                                                <div className="flex flex-col gap-1 w-full sm:max-w-xs">
                                                    <label className="text-[10px] font-black text-slate-400">Enroll student in new course</label>
                                                    <select
                                                        value={selectedCourseEnroll[student.id] || ''}
                                                        onChange={e => setSelectedCourseEnroll(prev => ({
                                                            ...prev,
                                                            [student.id]: e.target.value
                                                        }))}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs dark:text-neutral-200"
                                                    >
                                                        <option value="">-- Choose Course --</option>
                                                        {availableCourses.map(course => (
                                                            <option key={course.id} value={course.id}>
                                                                {course.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => handleEnrollStudent(student.id)}
                                                    className="w-full sm:w-auto rounded-xl bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 mt-5 hover:bg-indigo-600 active:scale-95 transition-all"
                                                >
                                                    Add Course
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Edit Student Profile Dialog */}
                {isEditModalOpen && editingStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl w-full max-w-sm relative border border-slate-100 dark:border-neutral-800 flex flex-col gap-4">
                            <button
                                onClick={closeEditModal}
                                className="absolute right-4 top-4 size-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-400 hover:text-slate-500"
                            >
                                <X className="size-4" />
                            </button>

                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-neutral-200">
                                    Edit Student Details ✏️
                                </h2>
                                <p className="text-xs text-slate-400">Update account credentials for {editingStudent.name}.</p>
                            </div>

                            <form onSubmit={handleUpdateStudent} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                                        required
                                    />
                                    {errors.name && <span className="text-rose-500 text-xs font-bold">{errors.name}</span>}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                                        required
                                    />
                                    {errors.email && <span className="text-rose-500 text-xs font-bold">{errors.email}</span>}
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-50 dark:border-neutral-800/50 pt-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 hover:bg-indigo-600"
                                    >
                                        {processing ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
