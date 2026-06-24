import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';
import { motion } from 'framer-motion';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-50 to-pink-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            
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
                    className="absolute left-20 bottom-24 text-4xl opacity-40"
                >
                    ⭐
                </motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.15, 1], y: [0, -8, 0] }} 
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute right-24 bottom-32 text-4xl opacity-40"
                >
                    ✨
                </motion.div>
                <motion.div 
                    animate={{ y: [0, -25, 0], x: [0, 5, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/4 top-1/4 text-4xl opacity-25"
                >
                    🚀
                </motion.div>
                <motion.div 
                    animate={{ y: [0, 15, 0] }} 
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute right-1/4 top-1/3 text-4xl opacity-25"
                >
                    🪐
                </motion.div>
            </div>

            {/* Custom Authentication Card */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 12 }}
                className="w-full max-w-md bg-white/95 dark:bg-neutral-900/95 border-2 border-slate-100 dark:border-neutral-800/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-md relative z-10"
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3">
                        {/* Bouncy Globe Link */}
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 transition-transform active:scale-90"
                        >
                            <AppLogoIcon className="size-16 text-3xl shrink-0" />
                            <span className="sr-only">Go Home</span>
                        </Link>

                        <div className="space-y-1.5 text-center mt-2">
                            <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-100 tracking-tight">
                                {title}
                            </h1>
                            <p className="text-center text-xs font-black text-indigo-500 tracking-wide uppercase">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-2">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
