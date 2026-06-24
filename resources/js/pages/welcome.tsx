import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Compass, Trophy } from 'lucide-react';

interface WelcomeProps {
    canRegister?: boolean;
}

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth } = usePage().props as any;

    const cards = [
        {
            icon: '🧪',
            title: 'Space Quest',
            desc: 'Meet our planet neighbors and learn how astronauts bounce on the moon!',
            bg: 'bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/50',
            text: 'text-sky-600 dark:text-sky-400',
        },
        {
            icon: '💻',
            title: 'Coding Adventure',
            desc: 'Teach robot Robo how to speak to computers and repeat actions with loops!',
            bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50',
            text: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            icon: '🪄',
            title: 'Math Magic',
            desc: 'Cast wizard addition spells and solve matching number puzzles!',
            bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50',
            text: 'text-amber-600 dark:text-amber-400',
        },
        {
            icon: '🎨',
            title: 'Art Studio',
            desc: 'Mix rainbow colors and paint landscapes on your digital canvas!',
            bg: 'bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/50',
            text: 'text-pink-600 dark:text-pink-400',
        },
    ];

    return (
        <div className="relative min-h-svh flex flex-col items-center justify-between p-6 md:p-10 overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 font-sans">
            <Head title="Welcome to BitByWorld" />

            {/* Playful Floating Background Items */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
                <motion.div 
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-10 top-12 text-5xl md:text-6xl opacity-35"
                >
                    ☁️
                </motion.div>
                <motion.div 
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute right-12 top-20 text-5xl md:text-6xl opacity-35"
                >
                    ☁️
                </motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-20 bottom-24 text-4xl opacity-45"
                >
                    ⭐
                </motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.15, 1], y: [0, -8, 0] }} 
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute right-24 bottom-32 text-4xl opacity-45"
                >
                    ✨
                </motion.div>
                <motion.div 
                    animate={{ y: [0, -25, 0], x: [0, 5, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/4 top-1/4 text-4xl opacity-30"
                >
                    🚀
                </motion.div>
                <motion.div 
                    animate={{ y: [0, 15, 0] }} 
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute right-1/4 top-1/3 text-4xl opacity-30"
                >
                    🪐
                </motion.div>
            </div>

            {/* Custom Header Nav */}
            <header className="w-full max-w-5xl flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <AppLogoIcon className="size-10 text-xl" />
                    <span className="font-black text-slate-800 dark:text-neutral-100 text-lg tracking-tight">
                        BitByWorld
                    </span>
                </div>

                <nav className="flex items-center gap-3">
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                        >
                            Go to Map 🚀
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="text-xs font-black text-slate-600 hover:text-slate-800 dark:text-neutral-300 dark:hover:text-neutral-100 px-3 py-2"
                            >
                                Log In
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20"
                                >
                                    Sign Up 🎒
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </header>

            {/* Main Interactive Hero Card */}
            <main className="w-full max-w-4xl bg-white/95 dark:bg-neutral-900/95 border-2 border-slate-100 dark:border-neutral-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md relative z-10 my-8 flex flex-col items-center text-center gap-8">
                
                {/* Hero Title */}
                <div className="flex flex-col items-center gap-3 max-w-2xl">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className="size-20 rounded-[2rem] bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/20 select-none cursor-pointer"
                    >
                        🌍
                    </motion.div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-neutral-50 tracking-tight leading-none mt-2">
                        Welcome to <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">BitByWorld!</span>
                    </h1>
                    <p className="text-slate-500 dark:text-neutral-400 text-sm md:text-base font-semibold leading-relaxed mt-2">
                        Where learning feels like an adventure game! Watch fun videos, listen to awesome audio stories, view picture galleries, and earn star trophies! 🏆
                    </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-white text-sm font-black hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                        >
                            Open My Adventure Map 🗺️
                            <ArrowRight className="size-4" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-white text-sm font-black hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                            >
                                Let's Play! (Log In) 🔑
                                <ArrowRight className="size-4" />
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-slate-100 hover:border-slate-200 dark:bg-neutral-800 dark:border-neutral-700 px-8 py-4 text-slate-700 dark:text-neutral-200 text-sm font-black transition-all active:scale-95 shadow-sm"
                                >
                                    Become an Explorer (Sign Up) 🎒
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Adventure Worlds Showcase Grid */}
                <div className="w-full mt-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                        Explore Amazing Quests
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-left">
                        {cards.map((card, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -4 }}
                                className={`rounded-2xl border p-4 flex flex-col gap-2 shadow-sm transition-all ${card.bg}`}
                            >
                                <span className="text-3xl">{card.icon}</span>
                                <h4 className={`font-black text-sm ${card.text}`}>{card.title}</h4>
                                <p className="text-slate-500 dark:text-neutral-400 text-[11px] leading-relaxed font-semibold">
                                    {card.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full max-w-5xl text-center relative z-10 mt-4">
                <p className="text-slate-400 dark:text-neutral-500 text-[11px] font-black tracking-wide">
                    &copy; 2026 BitByWorld. Made with love for curious kids! 🪐
                </p>
            </footer>
        </div>
    );
}
