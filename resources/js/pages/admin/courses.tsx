import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { 
    Plus, Edit2, Trash2, Video, Volume2, Image as ImageIcon, 
    X, AlertTriangle, ExternalLink, Settings, ArrowRight,
    Play, ChevronRight, FileText, Music, Save
} from 'lucide-react';

interface LessonImage {
    id: number;
    lesson_id: number;
    image_path: string;
}

interface LessonAudio {
    id: number;
    lesson_id: number;
    title: string;
    audio_path: string;
}

interface Lesson {
    id: number;
    course_id: number;
    title: string;
    description: string | null;
    youtube_link: string | null;
    sort_order: number;
    images: LessonImage[];
    audios: LessonAudio[];
}

interface QuizOption {
    id?: number;
    question_id?: number;
    option_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: number;
    quiz_id: number;
    question_text: string;
    sort_order: number;
    options: QuizOption[];
}

interface Quiz {
    id: number;
    course_id: number;
    title: string;
    description: string | null;
    questions: QuizQuestion[];
    created_at: string;
    updated_at: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_path: string | null;
    lessons: Lesson[];
    quizzes?: Quiz[];
    enrollments_count?: number;
    created_at: string;
    updated_at: string;
}

interface AdminCoursesProps {
    courses: Course[];
}

export default function Courses({ courses = [] }: AdminCoursesProps) {
    const { storageUrl } = usePage().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Courses', href: '/admin/courses' },
    ];

    // Drawer tabs state
    const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');

    // Main Course Modals
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Lessons Panel States
    const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
    const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    // Quiz Panel States
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<Quiz | null>(null);
    const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

    // Inertia form for Courses
    const courseForm = useForm({
        title: '',
        description: '',
        thumbnail_file: null as File | null,
    });

    // Inertia form for Lessons
    const lessonForm = useForm({
        title: '',
        description: '',
        youtube_link: '',
        images: [] as File[],
        audio_files: [] as File[],
        audio_titles: [] as string[],
    });

    // Inertia form for Quizzes
    const quizForm = useForm({
        title: '',
        description: '',
    });

    // Inertia form for Questions
    const questionForm = useForm({
        question_text: '',
        options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ] as QuizOption[],
    });

    // Sync selected course lessons details if props refresh
    const activeCourseDetail = selectedCourseForLessons 
        ? courses.find(c => c.id === selectedCourseForLessons.id) || null 
        : null;

    // Keep editingLesson in sync if the courses list changes
    useEffect(() => {
        if (editingLesson) {
            const activeCourse = courses.find(c => c.id === selectedCourseForLessons?.id);
            if (activeCourse) {
                const updatedLesson = activeCourse.lessons.find(l => l.id === editingLesson.id) || null;
                setEditingLesson(updatedLesson);
            }
        }
    }, [courses]);

    // Keep selectedQuizForQuestions in sync if courses or activeCourseDetail changes
    useEffect(() => {
        if (selectedQuizForQuestions && activeCourseDetail) {
            const updatedQuiz = activeCourseDetail.quizzes?.find(q => q.id === selectedQuizForQuestions.id) || null;
            setSelectedQuizForQuestions(updatedQuiz);
        }
    }, [courses, activeCourseDetail]);

    // Course CRUD Handlers
    const openCreateCourseModal = () => {
        courseForm.reset();
        courseForm.clearErrors();
        setEditingCourse(null);
        setIsCourseModalOpen(true);
    };

    const openEditCourseModal = (course: Course) => {
        courseForm.clearErrors();
        setEditingCourse(course);
        courseForm.setData({
            title: course.title,
            description: course.description,
            thumbnail_file: null,
        });
        setIsCourseModalOpen(true);
    };

    const handleCourseSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCourse) {
            courseForm.post(`/admin/courses/${editingCourse.id}`, {
                onSuccess: () => {
                    setIsCourseModalOpen(false);
                    courseForm.reset();
                },
            });
        } else {
            courseForm.post('/admin/courses', {
                onSuccess: () => {
                    setIsCourseModalOpen(false);
                    courseForm.reset();
                },
            });
        }
    };

    const handleCourseDelete = (courseId: number) => {
        if (confirm('Are you sure you want to delete this course? All lessons, audios, and student progress will be permanently deleted.')) {
            router.delete(`/admin/courses/${courseId}`, {
                onSuccess: () => {
                    if (selectedCourseForLessons?.id === courseId) {
                        setSelectedCourseForLessons(null);
                    }
                }
            });
        }
    };

    // Lesson CRUD Handlers
    const openCreateLessonForm = () => {
        lessonForm.reset();
        lessonForm.clearErrors();
        setEditingLesson(null);
        setIsLessonFormOpen(true);
    };

    const openEditLessonForm = (lesson: Lesson) => {
        lessonForm.clearErrors();
        setEditingLesson(lesson);
        lessonForm.setData({
            title: lesson.title,
            description: lesson.description || '',
            youtube_link: lesson.youtube_link || '',
            images: [],
            audio_files: [],
            audio_titles: [],
        });
        setIsLessonFormOpen(true);
    };

    const handleLessonSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseForLessons) return;

        if (editingLesson) {
            lessonForm.post(`/admin/lessons/${editingLesson.id}`, {
                onSuccess: () => {
                    setIsLessonFormOpen(false);
                    lessonForm.reset();
                    const updatedCourse = courses.find(c => c.id === selectedCourseForLessons.id);
                    if (updatedCourse) setSelectedCourseForLessons(updatedCourse);
                }
            });
        } else {
            lessonForm.post(`/admin/courses/${selectedCourseForLessons.id}/lessons`, {
                onSuccess: () => {
                    setIsLessonFormOpen(false);
                    lessonForm.reset();
                    const updatedCourse = courses.find(c => c.id === selectedCourseForLessons.id);
                    if (updatedCourse) setSelectedCourseForLessons(updatedCourse);
                }
            });
        }
    };

    const handleLessonDelete = (lessonId: number) => {
        if (confirm('Are you sure you want to delete this lesson? All associated media files will be deleted.')) {
            router.delete(`/admin/lessons/${lessonId}`, {
                onSuccess: () => {
                    if (selectedCourseForLessons) {
                        const updatedCourse = courses.find(c => c.id === selectedCourseForLessons.id);
                        if (updatedCourse) setSelectedCourseForLessons(updatedCourse);
                    }
                }
            });
        }
    };

    const handleImageDelete = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(`/admin/lesson-images/${imageId}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleAudioDelete = (audioId: number) => {
        if (confirm('Are you sure you want to delete this audio track?')) {
            router.delete(`/admin/lesson-audios/${audioId}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    // Quiz CRUD Handlers
    const openCreateQuizModal = () => {
        quizForm.reset();
        quizForm.clearErrors();
        setEditingQuiz(null);
        setIsQuizModalOpen(true);
    };

    const openEditQuizModal = (quiz: Quiz) => {
        quizForm.clearErrors();
        setEditingQuiz(quiz);
        quizForm.setData({
            title: quiz.title,
            description: quiz.description || '',
        });
        setIsQuizModalOpen(true);
    };

    const handleQuizSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseForLessons) return;

        if (editingQuiz) {
            quizForm.put(`/admin/quizzes/${editingQuiz.id}`, {
                onSuccess: () => {
                    setIsQuizModalOpen(false);
                    quizForm.reset();
                },
            });
        } else {
            quizForm.post(`/admin/courses/${selectedCourseForLessons.id}/quizzes`, {
                onSuccess: () => {
                    setIsQuizModalOpen(false);
                    quizForm.reset();
                },
            });
        }
    };

    const handleQuizDelete = (quizId: number) => {
        if (confirm('Are you sure you want to delete this quiz? All questions, choices, and student attempts will be deleted.')) {
            router.delete(`/admin/quizzes/${quizId}`, {
                onSuccess: () => {
                    if (selectedQuizForQuestions?.id === quizId) {
                        setSelectedQuizForQuestions(null);
                    }
                }
            });
        }
    };

    // Question CRUD Handlers
    const openCreateQuestionForm = () => {
        questionForm.reset();
        questionForm.clearErrors();
        setEditingQuestion(null);
        setIsQuestionFormOpen(true);
    };

    const openEditQuestionForm = (question: QuizQuestion) => {
        questionForm.clearErrors();
        setEditingQuestion(question);
        questionForm.setData({
            question_text: question.question_text,
            options: question.options.map(opt => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
            })),
        });
        setIsQuestionFormOpen(true);
    };

    const handleQuestionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuizForQuestions) return;

        if (editingQuestion) {
            questionForm.put(`/admin/questions/${editingQuestion.id}`, {
                onSuccess: () => {
                    setIsQuestionFormOpen(false);
                    questionForm.reset();
                    setEditingQuestion(null);
                }
            });
        } else {
            questionForm.post(`/admin/quizzes/${selectedQuizForQuestions.id}/questions`, {
                onSuccess: () => {
                    setIsQuestionFormOpen(false);
                    questionForm.reset();
                }
            });
        }
    };

    const handleQuestionDelete = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/admin/questions/${questionId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Courses" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-slate-50 dark:from-neutral-900 dark:to-neutral-950 font-sans">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-neutral-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-200">
                            Course Adventure Manager 🪐
                        </h1>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm">
                            Configure learning courses and manage lesson-level multimedia files.
                        </p>
                    </div>
                    <button
                        onClick={openCreateCourseModal}
                        className="flex items-center gap-1.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-extrabold text-sm px-5 py-3 transition-all shadow-md shadow-indigo-500/20"
                    >
                        <Plus className="size-4" />
                        Create New Course
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    
                    {/* Courses Grid List */}
                    <div className={`${activeCourseDetail ? 'lg:col-span-7' : 'lg:col-span-12'} grid gap-6 sm:grid-cols-1 md:grid-cols-2`}>
                        {courses.length === 0 ? (
                            <div className="col-span-full bg-white dark:bg-neutral-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-neutral-800">
                                <AlertTriangle className="size-12 text-amber-500 mx-auto mb-3" />
                                <h3 className="font-extrabold text-slate-700 dark:text-neutral-300 text-lg">No courses exist yet</h3>
                                <p className="text-slate-400 dark:text-neutral-500 text-sm mt-1 mb-5">Click Create New Course to set up the first learning world.</p>
                            </div>
                        ) : (
                            courses.map(course => {
                                const isSelected = activeCourseDetail?.id === course.id;
                                return (
                                    <div 
                                        key={course.id}
                                        className={`bg-white dark:bg-neutral-900 rounded-3xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
                                            isSelected 
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                                            : 'border-slate-100 dark:border-neutral-800'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <div className="size-14 rounded-2xl bg-slate-50 dark:bg-neutral-800 p-1 shrink-0 overflow-hidden">
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
                                                        <span className="text-2xl flex items-center justify-center h-full">🎓</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-black text-slate-800 dark:text-neutral-200 truncate">
                                                        {course.title}
                                                    </h3>
                                                    <div className="flex gap-2 mt-0.5">
                                                        <span className="inline-block rounded-full bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 text-[9px] font-black text-slate-500">
                                                            {course.enrollments_count || 0} Students
                                                        </span>
                                                        <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/45 px-2 py-0.5 text-[9px] font-black text-indigo-500">
                                                            {course.lessons.length} Lessons
                                                        </span>
                                                        <span className="inline-block rounded-full bg-amber-50 dark:bg-amber-950/45 px-2 py-0.5 text-[9px] font-black text-amber-600">
                                                            {course.quizzes?.length || 0} Quizzes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-4 line-clamp-2">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-5">
                                            {/* Action buttons */}
                                            <button
                                                onClick={() => setSelectedCourseForLessons(course)}
                                                className={`flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-black rounded-xl active:scale-95 transition-all ${
                                                    isSelected 
                                                    ? 'bg-indigo-500 text-white shadow-sm'
                                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-neutral-800 dark:text-indigo-400'
                                                }`}
                                            >
                                                Manage Content ⚙️
                                                <ChevronRight className="size-3.5" />
                                            </button>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditCourseModal(course)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-black text-slate-600 hover:bg-slate-50 rounded-xl dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                >
                                                    <Edit2 className="size-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleCourseDelete(course.id)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50 rounded-xl dark:text-rose-400 dark:hover:bg-neutral-800"
                                                >
                                                    <Trash2 className="size-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                                      {/* Right Column: Lessons & Quizzes Manager drawer for active course */}
                    {activeCourseDetail && (
                        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                            {selectedQuizForQuestions ? (
                                /* ── QUIZ QUESTIONS BUILDER VIEW ── */
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-neutral-800/50 pb-3">
                                        <button 
                                            onClick={() => {
                                                setSelectedQuizForQuestions(null);
                                                setIsQuestionFormOpen(false);
                                            }}
                                            className="text-xs font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                        >
                                            ← Back to Quizzes
                                        </button>
                                        <h3 className="font-black text-slate-800 dark:text-neutral-200 text-xs truncate max-w-[200px]">
                                            Questions: {selectedQuizForQuestions.title}
                                        </h3>
                                    </div>

                                    {isQuestionFormOpen ? (
                                        /* ── QUESTION CREATE/EDIT FORM ── */
                                        <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4 bg-slate-50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-slate-100/50 dark:border-neutral-800 max-h-[550px] overflow-y-auto">
                                            <h4 className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                            </h4>

                                            {/* Question Text */}
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-[10px] font-black text-slate-400">Question Text</label>
                                                <textarea
                                                    value={questionForm.data.question_text}
                                                    onChange={e => questionForm.setData('question_text', e.target.value)}
                                                    placeholder="e.g. What color is the sun? ☀️"
                                                    rows={2}
                                                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 font-semibold"
                                                    required
                                                />
                                            </div>

                                            {/* Choices list */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-slate-400">Choices (Select correct answer using radio button)</label>
                                                {questionForm.data.options.map((option, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="is_correct"
                                                            checked={option.is_correct}
                                                            onChange={() => {
                                                                const updatedOptions = questionForm.data.options.map((opt, i) => ({
                                                                    ...opt,
                                                                    is_correct: i === idx
                                                                }));
                                                                questionForm.setData('options', updatedOptions);
                                                            }}
                                                            className="accent-indigo-500 cursor-pointer size-4"
                                                            title="Mark as correct answer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option.option_text}
                                                            onChange={(e) => {
                                                                const updatedOptions = [...questionForm.data.options];
                                                                updatedOptions[idx].option_text = e.target.value;
                                                                questionForm.setData('options', updatedOptions);
                                                            }}
                                                            placeholder={`Choice ${idx + 1}`}
                                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 font-bold"
                                                            required
                                                        />
                                                        {questionForm.data.options.length > 2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedOptions = questionForm.data.options.filter((_, i) => i !== idx);
                                                                    if (option.is_correct && updatedOptions.length > 0) {
                                                                        updatedOptions[0].is_correct = true;
                                                                    }
                                                                    questionForm.setData('options', updatedOptions);
                                                                }}
                                                                className="text-rose-500 text-xs font-bold hover:text-rose-600 px-1"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        questionForm.setData('options', [
                                                            ...questionForm.data.options,
                                                            { option_text: '', is_correct: false }
                                                        ]);
                                                    }}
                                                    className="mt-1 text-left text-xs font-black text-indigo-500 hover:text-indigo-600 self-start"
                                                >
                                                    + Add Another Choice
                                                </button>
                                            </div>

                                            {/* Submit Question */}
                                            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-neutral-800/80 pt-3 mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsQuestionFormOpen(false)}
                                                    className="text-[10px] font-black text-slate-400 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={questionForm.processing}
                                                    className="text-[10px] font-black bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50"
                                                >
                                                    {questionForm.processing ? 'Saving...' : 'Save Question'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        /* ── QUESTIONS LIST VIEW ── */
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={openCreateQuestionForm}
                                                className="flex items-center justify-center gap-1.5 w-full py-2.5 border-2 border-dashed border-indigo-100 hover:border-indigo-200 dark:border-neutral-800 rounded-2xl text-xs font-black text-indigo-500 active:scale-98 transition-all"
                                            >
                                                <Plus className="size-4" />
                                                Add Quiz Question
                                            </button>

                                            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                                                {selectedQuizForQuestions.questions?.length === 0 ? (
                                                    <div className="text-center py-8 text-slate-400 text-xs font-bold border border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl">
                                                        No questions in this quiz yet.
                                                    </div>
                                                ) : (
                                                    selectedQuizForQuestions.questions?.map((question, idx) => (
                                                        <div 
                                                            key={question.id}
                                                            className="bg-slate-50 dark:bg-neutral-800/35 border border-slate-100/60 dark:border-neutral-800/60 rounded-2xl p-4 flex flex-col gap-2.5"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <h5 className="text-xs font-black text-slate-800 dark:text-neutral-200 leading-tight">
                                                                    Q{idx + 1}. {question.question_text}
                                                                </h5>
                                                                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                                                    <button
                                                                        onClick={() => openEditQuestionForm(question)}
                                                                        className="size-7 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-800 flex items-center justify-center text-slate-500"
                                                                        title="Edit Question"
                                                                    >
                                                                        <Edit2 className="size-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleQuestionDelete(question.id)}
                                                                        className="size-7 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center"
                                                                        title="Delete Question"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-1.5 border-t border-slate-100/50 dark:border-neutral-800/50 pt-2">
                                                                {question.options.map((opt, i) => (
                                                                    <span 
                                                                        key={opt.id || i}
                                                                        className={`text-[10px] font-bold px-2 py-1.5 rounded-lg truncate ${
                                                                            opt.is_correct 
                                                                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                                                            : 'bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 text-slate-500'
                                                                        }`}
                                                                        title={opt.option_text}
                                                                    >
                                                                        {i + 1}. {opt.option_text} {opt.is_correct ? '✅' : ''}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── MAIN DRAWER PANEL (LESSONS OR QUIZZES TABS) ── */
                                <>
                                    <div className="flex items-center justify-between border-b border-slate-50 dark:border-neutral-800/50 pb-3">
                                        <div className="min-w-0">
                                            <span className="text-xs font-black text-slate-400">Manage Course Items</span>
                                            <h3 className="font-black text-slate-800 dark:text-neutral-200 truncate text-sm">
                                                {activeCourseDetail.title}
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedCourseForLessons(null);
                                                setSelectedQuizForQuestions(null);
                                            }}
                                            className="size-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center dark:bg-neutral-800 text-slate-400"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>

                                    {/* Tabs Swapping */}
                                    <div className="flex bg-slate-100 dark:bg-neutral-850 p-1 rounded-2xl">
                                        <button
                                            onClick={() => {
                                                setActiveTab('lessons');
                                                setIsLessonFormOpen(false);
                                            }}
                                            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                                                activeTab === 'lessons'
                                                ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            Lessons
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveTab('quizzes');
                                            }}
                                            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                                                activeTab === 'quizzes'
                                                ? 'bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            Quizzes ({activeCourseDetail.quizzes?.length || 0})
                                        </button>
                                    </div>

                                    {activeTab === 'lessons' ? (
                                        /* ── LESSONS TAB CONTENT ── */
                                        <>
                                            {isLessonFormOpen ? (
                                                <form onSubmit={handleLessonSubmit} className="flex flex-col gap-4 bg-slate-50 dark:bg-neutral-950/40 p-4 rounded-2xl border border-slate-100/50 dark:border-neutral-800 max-h-[550px] overflow-y-auto">
                                                    <h4 className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                        {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                                                    </h4>

                                                    {/* Title */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[10px] font-black text-slate-400">Lesson Title</label>
                                                        <input
                                                            type="text"
                                                            value={lessonForm.data.title}
                                                            onChange={e => lessonForm.setData('title', e.target.value)}
                                                            placeholder="e.g. The Giant Sun ☀️"
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 font-semibold"
                                                            required
                                                        />
                                                    </div>

                                                    {/* Description */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[10px] font-black text-slate-400">Description (Optional)</label>
                                                        <textarea
                                                            value={lessonForm.data.description}
                                                            onChange={e => lessonForm.setData('description', e.target.value)}
                                                            placeholder="Lesson narration or instruction steps."
                                                            rows={2}
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                                                        />
                                                    </div>

                                                    {/* YouTube link */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[10px] font-black text-slate-400">YouTube Video Link (Optional)</label>
                                                        <input
                                                            type="url"
                                                            value={lessonForm.data.youtube_link}
                                                            onChange={e => lessonForm.setData('youtube_link', e.target.value)}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                                                        />
                                                    </div>

                                                    {/* Multiple Images Upload */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[10px] font-black text-slate-400">Add Images (Optional)</label>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={e => {
                                                                if (e.target.files) {
                                                                    const filesArray = Array.from(e.target.files);
                                                                    lessonForm.setData('images', [...lessonForm.data.images, ...filesArray]);
                                                                }
                                                            }}
                                                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                                        />
                                                        {/* Staged Images list */}
                                                        {lessonForm.data.images.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                {lessonForm.data.images.map((file, i) => (
                                                                    <div key={i} className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 text-[10px] px-2 py-1 rounded-md text-slate-600 dark:text-neutral-300 font-medium">
                                                                        <span className="truncate max-w-[80px]">{file.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const copy = [...lessonForm.data.images];
                                                                                copy.splice(i, 1);
                                                                                lessonForm.setData('images', copy);
                                                                            }}
                                                                            className="text-rose-500 hover:text-rose-600 font-bold ml-1"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Multiple Audios Upload */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <label className="text-[10px] font-black text-slate-400">Add Audio Stories (Optional)</label>
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            multiple
                                                            onChange={e => {
                                                                if (e.target.files) {
                                                                    const filesArray = Array.from(e.target.files);
                                                                    lessonForm.setData({
                                                                        ...lessonForm.data,
                                                                        audio_files: [...lessonForm.data.audio_files, ...filesArray],
                                                                        audio_titles: [...lessonForm.data.audio_titles, ...filesArray.map(f => '')]
                                                                    });
                                                                }
                                                            }}
                                                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                                        />
                                                        {/* Staged Audios with custom titles */}
                                                        {lessonForm.data.audio_files.length > 0 && (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                {lessonForm.data.audio_files.map((file, i) => (
                                                                    <div key={i} className="flex flex-col gap-1 bg-white dark:bg-neutral-900 p-2 rounded-xl border border-slate-200/50">
                                                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                                                            <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const copyFiles = [...lessonForm.data.audio_files];
                                                                                    const copyTitles = [...lessonForm.data.audio_titles];
                                                                                    copyFiles.splice(i, 1);
                                                                                    copyTitles.splice(i, 1);
                                                                                    lessonForm.setData({
                                                                                        ...lessonForm.data,
                                                                                        audio_files: copyFiles,
                                                                                        audio_titles: copyTitles,
                                                                                    });
                                                                                }}
                                                                                className="text-rose-500 hover:text-rose-600 font-bold"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={lessonForm.data.audio_titles[i] || ''}
                                                                            onChange={e => {
                                                                                const copyTitles = [...lessonForm.data.audio_titles];
                                                                                copyTitles[i] = e.target.value;
                                                                                lessonForm.setData('audio_titles', copyTitles);
                                                                            }}
                                                                            placeholder="Audio Title (e.g. Story Narration)"
                                                                            className="w-full rounded-md border border-slate-200 px-2 py-1 text-[10px] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 font-semibold"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Existing Media Manager (Only in Edit Mode) */}
                                                    {editingLesson && (
                                                        <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-neutral-800/80 pt-4 mt-2">
                                                            <h4 className="text-[11px] font-black text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                                                                Uploaded Lesson Media
                                                            </h4>

                                                            {/* Existing Images */}
                                                            {editingLesson.images && editingLesson.images.length > 0 ? (
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400">Images Gallery</label>
                                                                    <div className="grid grid-cols-4 gap-2">
                                                                        {editingLesson.images.map((img) => (
                                                                            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200/50 dark:border-neutral-800 aspect-square bg-white flex items-center justify-center p-1">
                                                                                <img 
                                                                                    src={`${storageUrl}/${img.image_path}`} 
                                                                                    alt="Lesson image" 
                                                                                    className="max-h-full max-w-full object-contain rounded-lg"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleImageDelete(img.id)}
                                                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black transition-all rounded-lg"
                                                                                >
                                                                                    Delete 🗑️
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : null}

                                                            {/* Existing Audios */}
                                                            {editingLesson.audios && editingLesson.audios.length > 0 ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <label className="text-[10px] font-black text-slate-400">Audio Tracks</label>
                                                                    <div className="flex flex-col gap-2">
                                                                        {editingLesson.audios.map((aud) => (
                                                                            <ExistingAudioRow 
                                                                                key={aud.id} 
                                                                                audio={aud} 
                                                                                onAudioDelete={handleAudioDelete} 
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}

                                                    {/* Save controls */}
                                                    <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-neutral-800/80 pt-3 mt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsLessonFormOpen(false)}
                                                            className="text-[10px] font-black text-slate-400 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={lessonForm.processing}
                                                            className="text-[10px] font-black bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-50"
                                                        >
                                                            {lessonForm.processing ? 'Saving...' : 'Save Lesson'}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={openCreateLessonForm}
                                                    className="flex items-center justify-center gap-1.5 w-full py-2.5 border-2 border-dashed border-indigo-100 hover:border-indigo-200 dark:border-neutral-800 rounded-2xl text-xs font-black text-indigo-500 active:scale-98 transition-all"
                                                >
                                                    <Plus className="size-4" />
                                                    Add New Lesson
                                                </button>
                                            )}

                                            {/* Lessons List */}
                                            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1 mt-2">
                                                {activeCourseDetail.lessons.length === 0 ? (
                                                    <div className="text-center py-6 text-slate-400 text-xs font-bold border border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl">
                                                        No lessons in this course yet.
                                                    </div>
                                                ) : (
                                                    activeCourseDetail.lessons.map((lesson, idx) => (
                                                        <div 
                                                            key={lesson.id}
                                                            className="bg-slate-50 dark:bg-neutral-800/30 border border-slate-100/50 dark:border-neutral-800/50 rounded-2xl p-3 flex items-center justify-between"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <h5 className="text-xs font-black text-slate-800 dark:text-neutral-200 truncate">
                                                                    {idx + 1}. {lesson.title}
                                                                </h5>
                                                                {/* Details badges */}
                                                                <div className="flex gap-2 mt-1">
                                                                    {lesson.youtube_link && (
                                                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/45 px-1.5 py-0.5 rounded-md">
                                                                            <Video className="size-2.5" /> Video
                                                                        </span>
                                                                    )}
                                                                    {lesson.images && lesson.images.length > 0 && (
                                                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/45 px-1.5 py-0.5 rounded-md">
                                                                            <ImageIcon className="size-2.5" /> {lesson.images.length} Pics
                                                                        </span>
                                                                    )}
                                                                    {lesson.audios && lesson.audios.length > 0 && (
                                                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/45 px-1.5 py-0.5 rounded-md">
                                                                            <Volume2 className="size-2.5" /> {lesson.audios.length} Audios
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Lesson Actions */}
                                                            <div className="flex items-center gap-1.5 ml-2">
                                                                <button
                                                                    onClick={() => openEditLessonForm(lesson)}
                                                                    className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center text-slate-500"
                                                                    title="Edit Lesson"
                                                                >
                                                                    <Edit2 className="size-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleLessonDelete(lesson.id)}
                                                                    className="size-8 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center"
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        /* ── QUIZZES TAB CONTENT ── */
                                        <>
                                            <button
                                                onClick={openCreateQuizModal}
                                                className="flex items-center justify-center gap-1.5 w-full py-2.5 border-2 border-dashed border-amber-100 hover:border-amber-200 dark:border-neutral-800 rounded-2xl text-xs font-black text-amber-500 active:scale-98 transition-all"
                                            >
                                                <Plus className="size-4" />
                                                Add New Quiz
                                            </button>

                                            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1 mt-2">
                                                {activeCourseDetail.quizzes?.length === 0 ? (
                                                    <div className="text-center py-6 text-slate-400 text-xs font-bold border border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl">
                                                        No quizzes in this course yet.
                                                    </div>
                                                ) : (
                                                    activeCourseDetail.quizzes?.map((quiz) => (
                                                        <div 
                                                            key={quiz.id}
                                                            className="bg-slate-50 dark:bg-neutral-800/30 border border-slate-100/50 dark:border-neutral-800/50 rounded-2xl p-3 flex flex-col gap-2"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="min-w-0 flex-1">
                                                                    <h5 className="text-xs font-black text-slate-800 dark:text-neutral-200 truncate">
                                                                        {quiz.title}
                                                                    </h5>
                                                                    <span className="inline-block rounded-full bg-amber-50 dark:bg-amber-950/45 px-1.5 py-0.5 text-[9px] font-black text-amber-600 mt-1">
                                                                        {quiz.questions?.length || 0} Questions
                                                                    </span>
                                                                </div>

                                                                {/* Quiz Actions */}
                                                                <div className="flex items-center gap-1 ml-2">
                                                                    <button
                                                                        onClick={() => openEditQuizModal(quiz)}
                                                                        className="size-7 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center justify-center text-slate-500"
                                                                        title="Edit Quiz details"
                                                                    >
                                                                        <Edit2 className="size-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleQuizDelete(quiz.id)}
                                                                        className="size-7 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center"
                                                                        title="Delete Quiz"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedQuizForQuestions(quiz);
                                                                    setIsQuestionFormOpen(false);
                                                                }}
                                                                className="w-full mt-1 bg-white dark:bg-neutral-900 border border-slate-200/50 hover:bg-slate-50 dark:border-neutral-800 text-[10px] font-black text-indigo-500 py-1.5 rounded-xl transition-all active:scale-97"
                                                            >
                                                                Manage Questions 📝
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Create/Edit Course Dialog */}
                {isCourseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl w-full max-w-sm relative border border-slate-100 dark:border-neutral-800 flex flex-col gap-4">
                            <button
                                onClick={() => setIsCourseModalOpen(false)}
                                className="absolute right-4 top-4 size-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-400 hover:text-slate-500"
                            >
                                <X className="size-4" />
                            </button>

                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-neutral-200">
                                    {editingCourse ? 'Edit Course Adventure' : 'Create Course Adventure'}
                                </h2>
                                <p className="text-xs text-slate-400">Fill in the fields to configure the course map.</p>
                            </div>

                            <form onSubmit={handleCourseSubmit} className="flex flex-col gap-4">
                                {/* Title */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Course Title</label>
                                    <input
                                        type="text"
                                        value={courseForm.data.title}
                                        onChange={e => courseForm.setData('title', e.target.value)}
                                        placeholder="e.g. Science Quest: Space Trip!"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                                        required
                                    />
                                    {courseForm.errors.title && <span className="text-rose-500 text-xs font-bold">{courseForm.errors.title}</span>}
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Course Description</label>
                                    <textarea
                                        value={courseForm.data.description}
                                        onChange={e => courseForm.setData('description', e.target.value)}
                                        placeholder="What is this course about?"
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                                        required
                                    />
                                    {courseForm.errors.description && <span className="text-rose-500 text-xs font-bold">{courseForm.errors.description}</span>}
                                </div>

                                {/* Thumbnail image */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Course Badge Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => courseForm.setData('thumbnail_file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                    />
                                    {courseForm.errors.thumbnail_file && <span className="text-rose-500 text-xs font-bold">{courseForm.errors.thumbnail_file}</span>}
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-3 border-t border-slate-50 dark:border-neutral-800/50 pt-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCourseModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={courseForm.processing}
                                        className="rounded-xl bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 hover:bg-indigo-600"
                                    >
                                        {courseForm.processing ? 'Saving...' : 'Save Course'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create/Edit Quiz Dialog */}
                {isQuizModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-xl w-full max-w-sm relative border border-slate-100 dark:border-neutral-800 flex flex-col gap-4">
                            <button
                                onClick={() => setIsQuizModalOpen(false)}
                                className="absolute right-4 top-4 size-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-400 hover:text-slate-500"
                            >
                                <X className="size-4" />
                            </button>

                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-neutral-200">
                                    {editingQuiz ? 'Edit Quiz Details' : 'Create Course Quiz 🏆'}
                                </h2>
                                <p className="text-xs text-slate-400">Fill in the fields to configure the quiz adventure.</p>
                            </div>

                            <form onSubmit={handleQuizSubmit} className="flex flex-col gap-4">
                                {/* Title */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Quiz Title</label>
                                    <input
                                        type="text"
                                        value={quizForm.data.title}
                                        onChange={e => quizForm.setData('title', e.target.value)}
                                        placeholder="e.g. Solar System Trivia 🌌"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-955 dark:text-neutral-200 font-bold"
                                        required
                                    />
                                    {quizForm.errors.title && <span className="text-rose-500 text-xs font-bold">{quizForm.errors.title}</span>}
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-black text-slate-700 dark:text-neutral-300">Description (Optional)</label>
                                    <textarea
                                        value={quizForm.data.description}
                                        onChange={e => quizForm.setData('description', e.target.value)}
                                        placeholder="Add introductory instructions for the quiz."
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-955 dark:text-neutral-200"
                                    />
                                    {quizForm.errors.description && <span className="text-rose-500 text-xs font-bold">{quizForm.errors.description}</span>}
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-3 border-t border-slate-50 dark:border-neutral-800/50 pt-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsQuizModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={quizForm.processing}
                                        className="rounded-xl bg-indigo-500 text-white font-extrabold text-xs px-5 py-2 hover:bg-indigo-600 active:scale-95 transition-all"
                                    >
                                        {quizForm.processing ? 'Saving...' : 'Save Quiz'}
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

function ExistingAudioRow({ 
    audio, 
    onAudioDelete 
}: { 
    audio: LessonAudio; 
    onAudioDelete: (id: number) => void 
}) {
    const [title, setTitle] = useState(audio.title);
    const [isSaving, setIsSaving] = useState(false);

    const handleRename = () => {
        if (!title.trim()) return;
        setIsSaving(true);
        router.patch(`/admin/lesson-audios/${audio.id}`, { title }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsSaving(false),
        });
    };

    return (
        <div className="flex flex-col gap-1.5 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-slate-200/50 dark:border-neutral-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[150px] font-bold text-slate-500 dark:text-neutral-400">
                    {audio.audio_path.split('/').pop()}
                </span>
                <button
                    type="button"
                    onClick={() => onAudioDelete(audio.id)}
                    className="text-rose-500 hover:text-rose-600 font-black"
                >
                    Delete 🗑️
                </button>
            </div>
            <div className="flex gap-1.5">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Audio Title"
                    className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 font-bold"
                />
                <button
                    type="button"
                    disabled={isSaving || title === audio.title}
                    onClick={handleRename}
                    className="rounded-lg bg-indigo-500 text-white font-extrabold text-[10px] px-2.5 py-1 disabled:opacity-40 hover:bg-indigo-600 active:scale-95 transition-all"
                >
                    {isSaving ? 'Saving...' : 'Rename 💾'}
                </button>
            </div>
        </div>
    );
}
