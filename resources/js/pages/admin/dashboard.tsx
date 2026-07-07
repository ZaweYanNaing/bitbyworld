import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import {
    Users, BookOpen, Trophy, GraduationCap, BarChart3, TrendingUp,
    ClipboardList, Lock, Unlock,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Stats {
    students: number;
    courses: number;
    quizzes: number;
    enrollments: number;
    attempts: number;
    openQuizzes: number;
    closedQuizzes: number;
}

interface EnrollmentData {
    name: string;
    enrollments: number;
}

interface AttemptData {
    month: string;
    attempts: number;
}

interface ScoreData {
    name: string;
    average: number;
}

interface RecentAttempt {
    id: number;
    student_name: string;
    quiz_title: string;
    course_title: string;
    score: number;
    total_questions: number;
    created_at: string;
}

interface AdminDashboardProps {
    stats: Stats;
    enrollmentsPerCourse: EnrollmentData[];
    quizAttemptsPerMonth: AttemptData[];
    averageScores: ScoreData[];
    recentAttempts: RecentAttempt[];
}

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard({
    stats,
    enrollmentsPerCourse = [],
    quizAttemptsPerMonth = [],
    averageScores = [],
    recentAttempts = [],
}: AdminDashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
    ];

    const quizStatusData = [
        { name: 'Open', value: stats.openQuizzes, color: '#10b981' },
        { name: 'Closed', value: stats.closedQuizzes, color: '#94a3b8' },
    ];

    const statCards = [
        { label: 'Students', value: stats.students, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
        { label: 'Quizzes', value: stats.quizzes, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Enrollments', value: stats.enrollments, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-slate-50 dark:from-neutral-900 dark:to-neutral-950 font-sans">
                <div className="border-b border-slate-100 dark:border-neutral-800 pb-4">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-200">
                        Admin Dashboard 📊
                    </h1>
                    <p className="text-slate-500 dark:text-neutral-400 text-sm">
                        Overview of students, courses, and quiz activity across the platform.
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-5 flex items-center gap-4 shadow-sm"
                        >
                            <div className={`size-12 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>
                                <card.icon className={`size-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-neutral-200">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Enrollments per Course */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="size-5 text-indigo-500" />
                            <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm">Enrollments per Course</h2>
                        </div>
                        {enrollmentsPerCourse.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={enrollmentsPerCourse}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="enrollments" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12">No enrollment data yet.</p>
                        )}
                    </div>

                    {/* Quiz Attempts Over Time */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="size-5 text-amber-500" />
                            <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm">Quiz Attempts (Last 6 Months)</h2>
                        </div>
                        {quizAttemptsPerMonth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={quizAttemptsPerMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="attempts" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12">No quiz attempts yet.</p>
                        )}
                    </div>
                </div>

                {/* Second Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Average Quiz Scores */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="size-5 text-emerald-500" />
                            <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm">Average Quiz Scores (%)</h2>
                        </div>
                        {averageScores.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={averageScores} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                                    <Tooltip />
                                    <Bar dataKey="average" fill="#10b981" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12">No quiz scores yet.</p>
                        )}
                    </div>

                    {/* Quiz Open/Closed Status */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardList className="size-5 text-sky-500" />
                            <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm">Quiz Status</h2>
                        </div>
                        {stats.quizzes > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={quizStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {quizStatusData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-12">No quizzes created yet.</p>
                        )}
                        <div className="flex justify-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <Unlock className="size-3" /> {stats.openQuizzes} Open
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                <Lock className="size-3" /> {stats.closedQuizzes} Closed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Quiz Attempts */}
                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-100 dark:border-neutral-800 p-6 shadow-sm">
                    <h2 className="font-black text-slate-800 dark:text-neutral-200 text-sm mb-4">
                        Recent Quiz Attempts
                    </h2>
                    {recentAttempts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-neutral-800">
                                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wider">Student</th>
                                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wider">Quiz</th>
                                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wider">Course</th>
                                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wider">Score</th>
                                        <th className="text-left py-2 font-black text-slate-400 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAttempts.map((attempt) => (
                                        <tr key={attempt.id} className="border-b border-slate-50 dark:border-neutral-800/50">
                                            <td className="py-3 font-bold text-slate-700 dark:text-neutral-300">{attempt.student_name}</td>
                                            <td className="py-3 text-slate-600 dark:text-neutral-400">{attempt.quiz_title}</td>
                                            <td className="py-3 text-slate-600 dark:text-neutral-400">{attempt.course_title}</td>
                                            <td className="py-3">
                                                <span className="font-black text-indigo-500">
                                                    {attempt.score}/{attempt.total_questions}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-400">
                                                {new Date(attempt.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 text-center py-8">No quiz attempts recorded yet.</p>
                    )}
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/courses"
                        className="rounded-2xl bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 hover:bg-indigo-600 transition-all"
                    >
                        Manage Courses
                    </Link>
                    <Link
                        href="/admin/students"
                        className="rounded-2xl bg-sky-500 text-white font-extrabold text-xs px-5 py-2.5 hover:bg-sky-600 transition-all"
                    >
                        Manage Students
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
