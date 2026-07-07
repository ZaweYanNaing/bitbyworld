import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    ArrowLeft, Trophy, Users, RotateCcw, CheckCircle2, Clock,
    BarChart3, ChevronDown, ChevronUp,
} from 'lucide-react';

interface QuizOption {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: number;
    question_text: string;
    options: QuizOption[];
}

interface Quiz {
    id: number;
    course_id: number;
    title: string;
    description: string | null;
    is_open: boolean;
    questions: QuizQuestion[];
    course: { id: number; title: string };
}

interface Attempt {
    id: number;
    user_id: number;
    student_name: string;
    student_email: string;
    score: number;
    total_questions: number;
    percentage: number;
    answers: Record<string, number>;
    created_at: string;
}

interface EnrolledStudent {
    id: number;
    name: string;
    email: string;
    has_attempted: boolean;
    latest_score: number | null;
    latest_total: number | null;
    has_pending_grant: boolean;
}

interface QuizResultsProps {
    quiz: Quiz;
    attempts: Attempt[];
    enrolledStudents: EnrolledStudent[];
}

export default function QuizResults({ quiz, attempts = [], enrolledStudents = [] }: QuizResultsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Manage Courses', href: '/admin/courses' },
        { title: `Results: ${quiz.title}`, href: `/admin/quizzes/${quiz.id}/results` },
    ];

    const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);

    const handleGrantRetake = (userId: number, studentName: string) => {
        if (confirm(`Grant another attempt to ${studentName}?`)) {
            router.post(`/admin/quizzes/${quiz.id}/grant-retake`, { user_id: userId }, {
                preserveScroll: true,
            });
        }
    };

    const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz Results: ${quiz.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-slate-50 dark:from-neutral-900 dark:to-neutral-950 font-sans">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-4">
                    <div>
                        <Link
                            href="/admin/courses"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-600 mb-2"
                        >
                            <ArrowLeft className="size-3" /> Back to Courses
                        </Link>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-200 flex items-center gap-2">
                            <Trophy className="size-6 text-amber-500" />
                            {quiz.title}
                        </h1>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm">
                            Course: {quiz.course.title} · {quiz.questions.length} Questions ·
                            <span className={quiz.is_open ? 'text-emerald-500 font-bold' : 'text-slate-400 font-bold'}>
                                {quiz.is_open ? ' Open' : ' Closed'}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-5 flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                            <Users className="size-6 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">Total Attempts</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-neutral-200">{attempts.length}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-5 flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                            <BarChart3 className="size-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">Average Score</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-neutral-200">{avgScore}%</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-5 flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                            <CheckCircle2 className="size-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400">Students Attempted</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-neutral-200">
                                {enrolledStudents.filter(s => s.has_attempted).length}/{enrolledStudents.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student Management - Grant Retakes */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                    <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm mb-4">
                        Manage Student Attempts
                    </h2>
                    {enrolledStudents.length === 0 ? (
                        <p className="text-xs text-slate-400">No students enrolled in this course.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {enrolledStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="bg-slate-50 dark:bg-neutral-800/30 border border-slate-100 dark:border-neutral-800 rounded-2xl p-4 flex flex-col gap-2"
                                >
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 dark:text-neutral-200">{student.name}</h4>
                                        <p className="text-[10px] text-slate-400">{student.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {student.has_attempted ? (
                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">
                                                Score: {student.latest_score}/{student.latest_total}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                                Not attempted
                                            </span>
                                        )}
                                        {student.has_pending_grant && (
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                                                Retake granted
                                            </span>
                                        )}
                                    </div>
                                    {student.has_attempted && !student.has_pending_grant && (
                                        <button
                                            onClick={() => handleGrantRetake(student.id, student.name)}
                                            className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                                        >
                                            <RotateCcw className="size-3" />
                                            Grant Retake
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Attempts */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                    <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm mb-4">
                        All Quiz Attempts ({attempts.length})
                    </h2>
                    {attempts.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">No attempts recorded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {attempts.map((attempt) => {
                                const isExpanded = expandedAttemptId === attempt.id;
                                return (
                                    <div
                                        key={attempt.id}
                                        className="bg-slate-50 dark:bg-neutral-800/30 border border-slate-100 dark:border-neutral-800 rounded-2xl overflow-hidden"
                                    >
                                        <div className="p-4 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="size-9 rounded-xl bg-indigo-50 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-indigo-500 shrink-0">
                                                    {attempt.student_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-black text-slate-800 dark:text-neutral-200 truncate">
                                                        {attempt.student_name}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {new Date(attempt.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-black ${
                                                    attempt.percentage >= 80 ? 'text-emerald-500'
                                                    : attempt.percentage >= 50 ? 'text-amber-500'
                                                    : 'text-rose-500'
                                                }`}>
                                                    {attempt.score}/{attempt.total_questions} ({attempt.percentage}%)
                                                </span>
                                                <button
                                                    onClick={() => setExpandedAttemptId(isExpanded ? null : attempt.id)}
                                                    className="size-8 rounded-lg bg-white dark:bg-neutral-900 flex items-center justify-center text-slate-400"
                                                >
                                                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-slate-100 dark:border-neutral-800 p-4 flex flex-col gap-3">
                                                {quiz.questions.map((question, qIdx) => {
                                                    const selectedOptionId = attempt.answers?.[question.id];
                                                    const correctOption = question.options.find(o => o.is_correct);
                                                    const isCorrect = selectedOptionId === correctOption?.id;

                                                    return (
                                                        <div
                                                            key={question.id}
                                                            className={`p-3 rounded-xl border text-xs ${
                                                                isCorrect
                                                                    ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40'
                                                                    : 'bg-rose-50/50 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/40'
                                                            }`}
                                                        >
                                                            <p className="font-black text-slate-700 dark:text-neutral-300 mb-1">
                                                                {qIdx + 1}. {question.question_text}
                                                                <span className="ml-2 text-[10px]">{isCorrect ? '✅' : '❌'}</span>
                                                            </p>
                                                            <div className="grid gap-1 sm:grid-cols-2">
                                                                {question.options.map((option) => {
                                                                    const isSelected = selectedOptionId === option.id;
                                                                    const isOptionCorrect = option.is_correct;
                                                                    return (
                                                                        <div
                                                                            key={option.id}
                                                                            className={`px-2 py-1 rounded-lg text-[10px] ${
                                                                                isSelected && isOptionCorrect ? 'bg-emerald-500 text-white font-bold'
                                                                                : isSelected ? 'bg-rose-500 text-white font-bold'
                                                                                : isOptionCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold'
                                                                                : 'text-slate-500'
                                                                            }`}
                                                                        >
                                                                            {option.option_text}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
