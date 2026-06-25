import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { BookOpen, Trophy, Play, Star } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Lesson {
    id: number;
    title: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_path: string | null;
    lessons: Lesson[];
}

interface DashboardProps {
    courses: Course[];
    completedLessonIds: number[];
}

export default function Dashboard({ courses = [], completedLessonIds = [] }: DashboardProps) {
    const { auth, storageUrl } = usePage().props;
    const user = auth.user;

    // Map courses with progress calculations
    const coursesWithProgress = courses.map(course => {
        const total = course.lessons.length;
        const completed = course.lessons.filter(l => completedLessonIds.includes(l.id)).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return {
            ...course,
            totalLessonsCount: total,
            completedLessonsCount: completed,
            progressPercent: progress,
            isCourseCompleted: total > 0 && completed === total
        };
    });

    const activeCourses = coursesWithProgress.filter(c => !c.isCourseCompleted);
    const completedCourses = coursesWithProgress.filter(c => c.isCourseCompleted);

    // Container animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Adventure Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-6 bg-gradient-to-b from-sky-50/50 to-white dark:from-neutral-900 dark:to-neutral-950 font-sans">
                
                {/* Welcoming Banner */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 80, damping: 10 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 p-8 text-white shadow-xl dark:shadow-neutral-900/50"
                >
                    <div className="relative z-10 max-w-lg">
                        <motion.h1 
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md"
                        >
                            Welcome back, {user?.name.split(' ')[0]}! 👋
                        </motion.h1>
                        <p className="mt-2 text-lg text-sky-50 drop-shadow-sm font-medium">
                            Ready to collect more stars and explore your learning maps? Learn at your own pace!
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-md">
                                <Trophy className="size-5 text-yellow-300 animate-bounce" />
                                <span>{completedCourses.length} Trophies Won</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-md">
                                <Star className="size-5 text-yellow-200 fill-yellow-200 animate-pulse" />
                                <span>{activeCourses.length} Active Missions</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-yellow-300/20 blur-xl"></div>
                    <div className="absolute right-20 top-2 size-24 rounded-full bg-pink-300/20 blur-lg"></div>
                </motion.div>

                {/* 1. Active Adventures */}
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-neutral-200 mb-4">
                        <BookOpen className="text-sky-500 size-6" />
                        My Active Adventures 🎒
                    </h2>
                    
                    {activeCourses.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border-2 border-dashed border-sky-100 dark:border-neutral-800 p-8 text-center bg-white dark:bg-neutral-900"
                        >
                            <p className="text-slate-500 dark:text-neutral-400 text-lg font-bold">No active learning quests right now!</p>
                            <p className="text-slate-400 dark:text-neutral-500 text-sm mt-1">An admin can assign new quests to your dashboard.</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {activeCourses.map(course => (
                                <motion.div
                                    key={course.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.03, rotate: 0.5 }}
                                    className="group relative overflow-hidden rounded-3xl border border-sky-100/50 bg-white p-5 shadow-md hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-sky-50 p-2 dark:bg-neutral-800">
                                            {course.thumbnail_path ? (
                                                <img 
                                                    src={`${storageUrl}/${course.thumbnail_path}`} 
                                                    alt={course.title}
                                                    className="size-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-3xl">🌟</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                                                {course.completedLessonsCount}/{course.totalLessonsCount} Lessons
                                            </span>
                                            <h3 className="font-extrabold text-slate-800 dark:text-neutral-200 mt-1 line-clamp-1">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-600 dark:text-neutral-400 text-sm line-clamp-2 min-h-[2.5rem]">
                                        {course.description}
                                    </p>
                                    
                                    {/* Dynamic Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs font-extrabold text-slate-400 mb-1">
                                            <span>Adventure Map</span>
                                            <span>{course.progressPercent}% Completed</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progressPercent}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between border-t border-slate-50 dark:border-neutral-800/50 pt-4">
                                        <Link 
                                            href={`/courses/${course.id}`}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3 text-sm font-black text-white hover:bg-sky-600 active:scale-95 transition-all shadow-md shadow-sky-500/20"
                                        >
                                            <Play className="size-4 fill-white" />
                                            Start Learning!
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* 2. Completed Adventures */}
                {completedCourses.length > 0 && (
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-black text-slate-800 dark:text-neutral-200 mb-4">
                            <Trophy className="text-amber-500 size-6" />
                            Completed Adventures 🏆
                        </h2>
                        
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {completedCourses.map(course => (
                                <motion.div
                                    key={course.id}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.03, rotate: 0.2 }}
                                    className="group relative overflow-hidden rounded-3xl border border-amber-100/50 bg-amber-50/20 p-5 shadow-sm hover:shadow-md dark:border-amber-950/20 dark:bg-amber-950/10 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 shrink-0 overflow-hidden rounded-2xl bg-amber-100/50 p-2 dark:bg-amber-950/50">
                                            {course.thumbnail_path ? (
                                                <img 
                                                    src={`${storageUrl}/${course.thumbnail_path}`} 
                                                    alt={course.title}
                                                    className="size-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-3xl">🏆</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                                <Star className="size-3 fill-amber-500 text-amber-500" />
                                                Perfect {course.totalLessonsCount}/{course.totalLessonsCount}
                                            </span>
                                            <h3 className="font-extrabold text-slate-800 dark:text-neutral-200 mt-1 line-clamp-1">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-600 dark:text-neutral-400 text-sm line-clamp-2 min-h-[2.5rem]">
                                        {course.description}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between border-t border-amber-100/50 dark:border-amber-950/20 pt-4">
                                        <Link 
                                            href={`/courses/${course.id}`}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                                        >
                                            Play Again 🔄
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
