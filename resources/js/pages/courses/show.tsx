import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Play, Pause, ChevronLeft, ChevronRight, Award, Volume2, Sparkles, CheckCircle, Circle, Music, Image as ImageIcon, Maximize2, X, ZoomIn } from 'lucide-react';

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
    images?: LessonImage[];
    audios?: LessonAudio[];
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_path: string | null;
}

interface ShowProps {
    course: Course;
    lessons: Lesson[];
    completedLessonIds: number[];
}

export default function Show({ course, lessons = [], completedLessonIds = [] }: ShowProps) {
    const { storageUrl } = usePage().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: course.title, href: `/courses/${course.id}` },
    ];

    // Find first uncompleted lesson, or default to first lesson
    const initialLesson = lessons.find(l => !completedLessonIds.includes(l.id)) || lessons[0] || null;
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(initialLesson);

    // Carousel Image State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Lightbox / Image Zoom State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [imageZoom, setImageZoom] = useState(100); // percent: 50–200

    // Audio player states
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [activeAudioTrack, setActiveAudioTrack] = useState<LessonAudio | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Reset audio & image states when active lesson changes
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setCurrentImageIndex(0);
        setIsLightboxOpen(false);
        setImageZoom(100);

        if (activeLesson && activeLesson.audios && activeLesson.audios.length > 0) {
            setActiveAudioTrack(activeLesson.audios[0]);
        } else {
            setActiveAudioTrack(null);
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
        }
    }, [activeLesson]);

    // Keyboard handler: Escape closes lightbox, arrow keys navigate images
    useEffect(() => {
        if (!isLightboxOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isLightboxOpen, activeLesson, currentImageIndex]);

    // Handle audio track changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            if (isPlaying && activeAudioTrack) {
                audioRef.current.play().catch(err => console.log('Audio playback error:', err));
            }
        }
    }, [activeAudioTrack]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // YouTube ID parser
    const getYouTubeEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) 
            ? `https://www.youtube.com/embed/${match[2]}?rel=0` 
            : null;
    };

    const embedUrl = activeLesson ? getYouTubeEmbedUrl(activeLesson.youtube_link) : null;

    // Audio handlers
    const togglePlay = () => {
        if (!audioRef.current || !activeAudioTrack) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => console.log('Audio playback error:', err));
            setIsPlaying(true);
        }
    };

    const handleSelectTrack = (track: LessonAudio) => {
        setActiveAudioTrack(track);
        setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newTime = parseFloat(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Carousel navigation
    const nextImage = () => {
        if (!activeLesson?.images || activeLesson.images.length === 0) return;
        setCurrentImageIndex((prev) => (prev + 1) % activeLesson.images!.length);
    };

    const prevImage = () => {
        if (!activeLesson?.images || activeLesson.images.length === 0) return;
        setCurrentImageIndex((prev) => (prev - 1 + activeLesson.images!.length) % activeLesson.images!.length);
    };

    const handleCompleteLesson = () => {
        if (!activeLesson) return;

        // Check if completing this lesson completes the entire course
        const willBeCompletedCount = completedLessonIds.includes(activeLesson.id) 
            ? completedLessonIds.length 
            : completedLessonIds.length + 1;
            
        const isCourseFullyCompleted = willBeCompletedCount === lessons.length;

        if (isCourseFullyCompleted) {
            // Big course complete celebration!
            const duration = 4 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        } else {
            // Standard lesson complete pop
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        router.post(`/lessons/${activeLesson.id}/complete`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // If there's a next lesson in the course, auto-advance to it!
                const activeIndex = lessons.findIndex(l => l.id === activeLesson.id);
                if (activeIndex !== -1 && activeIndex + 1 < lessons.length) {
                    setTimeout(() => {
                        setActiveLesson(lessons[activeIndex + 1]);
                    }, 1200);
                }
            }
        });
    };

    if (lessons.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={course.title} />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-6 text-center">
                    <span className="text-5xl">💤</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-neutral-200 mt-4">This course has no lessons!</h3>
                    <p className="text-slate-500 text-sm mt-1">Please ask the administrator to add lessons.</p>
                </div>
            </AppLayout>
        );
    }

    const isActiveCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false;
    const hasImages = activeLesson?.images && activeLesson.images.length > 0;
    const hasAudios = activeLesson?.audios && activeLesson.audios.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-gradient-to-b from-sky-50/30 to-white dark:from-neutral-900 dark:to-neutral-950 font-sans">
                
                {/* Back to dashboard */}
                <div>
                    <Link 
                        href="/dashboard" 
                        className="inline-flex items-center gap-1 text-sky-500 font-extrabold text-sm hover:text-sky-600 transition-all active:scale-95"
                    >
                        <ChevronLeft className="size-4" />
                        Back to Map
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    
                    {/* Left Column: Lessons Sidebar Navigation */}
                    <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 dark:border-neutral-800/50 pb-3">
                            <span className="text-xl">🗺️</span>
                            <h3 className="font-black text-slate-800 dark:text-neutral-200">Adventure Roadmap</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            {lessons.map((lesson, idx) => {
                                const isSelected = activeLesson?.id === lesson.id;
                                const isCompleted = completedLessonIds.includes(lesson.id);

                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setActiveLesson(lesson)}
                                        className={`w-full flex items-center justify-between text-left p-3.5 rounded-2xl transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-500/20' 
                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-neutral-800/50 dark:text-neutral-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xs font-black opacity-75">
                                                {idx + 1}.
                                            </span>
                                            <span className="text-sm font-bold truncate">
                                                {lesson.title}
                                            </span>
                                        </div>

                                        {isCompleted ? (
                                            <CheckCircle className={`size-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                                        ) : (
                                            <Circle className={`size-4.5 shrink-0 opacity-40`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Active Lesson View */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {activeLesson && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeLesson.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col gap-6"
                                >
                                    
                                    {/* Active Lesson Header */}
                                    <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            {isActiveCompleted ? (
                                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 px-3 py-1 text-xs font-black">
                                                    <CheckCircle className="size-4" /> Completed!
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 px-3 py-1 text-xs font-black">
                                                    Lesson Active
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-neutral-200 mt-2">
                                            {activeLesson.title}
                                        </h2>
                                        {activeLesson.description && (
                                            <p className="mt-2 text-slate-600 dark:text-neutral-400 text-sm font-medium">
                                                {activeLesson.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* YouTube Screen (Render if exists) */}
                                    {embedUrl && (
                                        <div className="overflow-hidden rounded-3xl bg-slate-900 shadow-lg border-4 border-slate-800">
                                            <div className="relative aspect-video w-full">
                                                <iframe
                                                    src={embedUrl}
                                                    title={activeLesson.title}
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                    className="absolute inset-0 size-full"
                                                ></iframe>
                                            </div>
                                        </div>
                                    )}

                                    {/* Images Gallery/Carousel (Render if exists) */}
                                    {hasImages && (
                                        <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                            {/* Gallery Header with zoom control */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200">
                                                    <ImageIcon className="text-emerald-500 size-5" />
                                                    <h3 className="text-sm font-black">Adventure Gallery 🎨</h3>
                                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                                        {currentImageIndex + 1} / {activeLesson.images!.length}
                                                    </span>
                                                </div>

                                                {/* Zoom Slider */}
                                                <div className="flex items-center gap-2">
                                                    <ZoomIn className="size-3.5 text-slate-400 shrink-0" />
                                                    <input
                                                        type="range"
                                                        min="50"
                                                        max="200"
                                                        step="10"
                                                        value={imageZoom}
                                                        onChange={(e) => setImageZoom(Number(e.target.value))}
                                                        className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                        title={`Zoom: ${imageZoom}%`}
                                                    />
                                                    <span className="text-[10px] font-black text-slate-400 w-9 text-right">{imageZoom}%</span>

                                                    {/* Full-screen button */}
                                                    <button
                                                        onClick={() => setIsLightboxOpen(true)}
                                                        title="View fullscreen"
                                                        className="ml-1 size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all active:scale-90"
                                                    >
                                                        <Maximize2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Main Image Area — click to open lightbox */}
                                            <div
                                                className="relative overflow-auto rounded-2xl bg-slate-50 dark:bg-neutral-950 flex items-center justify-center border-2 border-slate-100 dark:border-neutral-800 cursor-zoom-in group"
                                                style={{ minHeight: '200px', maxHeight: `${Math.round(350 * imageZoom / 100)}px` }}
                                                onClick={() => setIsLightboxOpen(true)}
                                                title="Click to view fullscreen"
                                            >
                                                {/* Main Carousel Image */}
                                                <AnimatePresence mode="wait">
                                                    <motion.img
                                                        key={currentImageIndex}
                                                        src={`${storageUrl}/${activeLesson.images![currentImageIndex].image_path}`}
                                                        alt={`Lesson image ${currentImageIndex + 1}`}
                                                        initial={{ opacity: 0, scale: 0.97 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.97 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="max-w-full object-contain rounded-xl select-none"
                                                        style={{ maxHeight: `${Math.round(340 * imageZoom / 100)}px` }}
                                                    />
                                                </AnimatePresence>

                                                {/* Hover overlay hint */}
                                                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center pointer-events-none">
                                                    <Maximize2 className="size-8 text-white drop-shadow opacity-0 group-hover:opacity-80 transition-opacity" />
                                                </div>

                                                {/* Navigation Chevrons */}
                                                {activeLesson.images!.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                                            className="absolute left-3 size-10 rounded-full bg-white/90 dark:bg-neutral-900/90 text-slate-800 dark:text-neutral-200 shadow-md hover:bg-white flex items-center justify-center transition-all active:scale-90"
                                                        >
                                                            <ChevronLeft className="size-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                                            className="absolute right-3 size-10 rounded-full bg-white/90 dark:bg-neutral-900/90 text-slate-800 dark:text-neutral-200 shadow-md hover:bg-white flex items-center justify-center transition-all active:scale-90"
                                                        >
                                                            <ChevronRight className="size-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Dot Indicators */}
                                            {activeLesson.images!.length > 1 && (
                                                <div className="flex justify-center gap-1.5 mt-1">
                                                    {activeLesson.images!.map((_, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentImageIndex(i)}
                                                            className={`size-2.5 rounded-full transition-all ${
                                                                currentImageIndex === i
                                                                ? 'bg-emerald-500 scale-110'
                                                                : 'bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Lightbox Modal ── */}
                                    <AnimatePresence>
                                        {isLightboxOpen && hasImages && (
                                            <motion.div
                                                key="lightbox"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                                                onClick={() => setIsLightboxOpen(false)}
                                            >
                                                {/* Image container — stop click propagation so clicking image doesn't close */}
                                                <motion.div
                                                    initial={{ scale: 0.92, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.92, opacity: 0 }}
                                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                                    className="relative flex items-center justify-center max-w-[95vw] max-h-[90vh]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        <motion.img
                                                            key={currentImageIndex}
                                                            src={`${storageUrl}/${activeLesson!.images![currentImageIndex].image_path}`}
                                                            alt={`Lesson image ${currentImageIndex + 1}`}
                                                            initial={{ opacity: 0, x: 30 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -30 }}
                                                            transition={{ duration: 0.18 }}
                                                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
                                                        />
                                                    </AnimatePresence>

                                                    {/* Lightbox Nav Chevrons */}
                                                    {activeLesson!.images!.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={prevImage}
                                                                className="absolute -left-14 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm"
                                                            >
                                                                <ChevronLeft className="size-6" />
                                                            </button>
                                                            <button
                                                                onClick={nextImage}
                                                                className="absolute -right-14 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm"
                                                            >
                                                                <ChevronRight className="size-6" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Image counter badge */}
                                                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs bg-black/60 text-white font-bold py-1 px-3 rounded-full backdrop-blur-sm">
                                                        {currentImageIndex + 1} / {activeLesson!.images!.length}
                                                    </span>
                                                </motion.div>

                                                {/* Close Button */}
                                                <button
                                                    onClick={() => setIsLightboxOpen(false)}
                                                    className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-90 backdrop-blur-sm"
                                                    title="Close (Esc)"
                                                >
                                                    <X className="size-5" />
                                                </button>

                                                {/* Hint text */}
                                                <p className="absolute bottom-4 right-4 text-[10px] text-white/40 font-bold hidden sm:block">Press Esc or click outside to close · ← → to navigate</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Custom Audio Player with Track List/Playlist (Render if exists) */}
                                    {hasAudios && activeAudioTrack && (
                                        <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                                            
                                            {/* Playlist Selection Panel (if multiple tracks) */}
                                            {activeLesson.audios!.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200 border-b border-slate-50 dark:border-neutral-800 pb-2">
                                                        <Music className="text-indigo-500 size-4.5" />
                                                        <h4 className="text-xs font-black">Choose a Audio Track to play:</h4>
                                                    </div>
                                                    <div className="grid gap-2 sm:grid-cols-2 max-h-[160px] overflow-y-auto pr-1">
                                                        {activeLesson.audios!.map((track) => {
                                                            const isSelected = activeAudioTrack.id === track.id;
                                                            return (
                                                                <button
                                                                    key={track.id}
                                                                    onClick={() => handleSelectTrack(track)}
                                                                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-left text-xs transition-all active:scale-98 ${
                                                                        isSelected
                                                                        ? 'bg-indigo-500 text-white font-extrabold shadow-sm'
                                                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-neutral-800/40 dark:text-neutral-300'
                                                                    }`}
                                                                >
                                                                    <Volume2 className={`size-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                                                                    <span className="truncate">{track.title}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Player Screen */}
                                            <div className="flex flex-col gap-4 border-t border-slate-50 dark:border-neutral-800/50 pt-4">
                                                <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200">
                                                    <Volume2 className="text-indigo-500 size-5" />
                                                    <h3 className="text-sm font-black">Now Playing: {activeAudioTrack.title} 🎧</h3>
                                                </div>

                                                {/* Hidden Audio Tag */}
                                                <audio
                                                    ref={audioRef}
                                                    src={`${storageUrl}/${activeAudioTrack.audio_path}`}
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onLoadedMetadata={handleLoadedMetadata}
                                                    onEnded={handleAudioEnded}
                                                />

                                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                                                    {/* Pulsing Play Button */}
                                                    <motion.button
                                                        onClick={togglePlay}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`size-12 rounded-full flex items-center justify-center text-white shadow-md transition-all ${
                                                            isPlaying 
                                                            ? 'bg-rose-500 shadow-rose-500/20' 
                                                            : 'bg-indigo-500 shadow-indigo-500/20'
                                                        }`}
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="size-5 fill-white" />
                                                        ) : (
                                                            <Play className="size-5 fill-white ml-0.5" />
                                                        )}
                                                    </motion.button>

                                                    {/* Bouncing graphical visualizer */}
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="flex items-center gap-1.5 h-6">
                                                            {Array.from({ length: 7 }).map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    animate={isPlaying ? {
                                                                        scaleY: [1, 2.5, 0.8, 1.8, 1],
                                                                    } : { scaleY: 1 }}
                                                                    transition={isPlaying ? {
                                                                        duration: 1.2,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.15,
                                                                        ease: 'easeInOut'
                                                                    } : {}}
                                                                    className={`w-1 rounded-full origin-center ${
                                                                        isPlaying 
                                                                        ? 'bg-indigo-500 h-2' 
                                                                        : 'bg-slate-300 dark:bg-neutral-700 h-2'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 mt-1">
                                                            {isPlaying ? 'Playing track...' : 'Paused'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Seek bar */}
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={duration || 100}
                                                        value={currentTime}
                                                        onChange={handleSeek}
                                                        className="w-full h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                    />
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                        <span>{formatTime(currentTime)}</span>
                                                        <span>{formatTime(duration)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )}

                                    {/* Completion Card */}
                                    <div className="bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-3xl p-6 shadow-sm text-center flex flex-col items-center gap-3">
                                        {isActiveCompleted ? (
                                            <>
                                                <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 text-2xl">
                                                    ⭐
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 dark:text-neutral-200">Lesson Completed!</h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">You earned a lesson star badge. Ready to move on?</p>
                                                </div>
                                                <button
                                                    onClick={handleCompleteLesson} // Confetti replay
                                                    className="rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-extrabold text-xs px-5 py-2.5 mt-2 active:scale-95 transition-all"
                                                >
                                                    Celebrate Again! 🎉
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="size-12 rounded-full bg-yellow-50 dark:bg-yellow-950/20 flex items-center justify-center text-yellow-500 text-2xl animate-pulse">
                                                    🏆
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 dark:text-neutral-200">Finish this Lesson Quest</h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">Explore the video, pictures and audio, then hit complete to claim your reward!</p>
                                                </div>
                                                <button
                                                    onClick={handleCompleteLesson}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 py-3.5 px-8 text-white text-sm font-black hover:from-yellow-500 hover:to-amber-600 transition-all shadow-md shadow-yellow-500/20 animate-pulse active:scale-95 mt-2"
                                                >
                                                    <Sparkles className="size-4 fill-white" />
                                                    Mark Lesson Completed!
                                                </button>
                                            </>
                                        )}
                                    </div>

                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
