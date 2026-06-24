import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { motion } from 'framer-motion';

export default function Register() {
    return (
        <AuthLayout
            title="Join the Adventure! 🎒"
            description="Create your explorer profile below"
        >
            <Head title="Sign Up" />
            
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            
                            {/* Name Input */}
                            <div className="grid gap-1.5">
                                <label 
                                    htmlFor="name" 
                                    className="text-xs font-black text-slate-600 dark:text-neutral-300 ml-1"
                                >
                                    My Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="e.g. Leo the Explorer"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email Input */}
                            <div className="grid gap-1.5">
                                <label 
                                    htmlFor="email" 
                                    className="text-xs font-black text-slate-600 dark:text-neutral-300 ml-1"
                                >
                                    My Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="your-name@email.com"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-1.5">
                                <label 
                                    htmlFor="password" 
                                    className="text-xs font-black text-slate-600 dark:text-neutral-300 ml-1"
                                >
                                    Choose Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Password Confirmation Input */}
                            <div className="grid gap-1.5">
                                <label 
                                    htmlFor="password_confirmation" 
                                    className="text-xs font-black text-slate-600 dark:text-neutral-300 ml-1"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Register Submit Button */}
                            <motion.button
                                type="submit"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                                whileTap={{ scale: 0.97 }}
                                className="mt-2 w-full rounded-2xl bg-indigo-500 py-3.5 text-white font-black text-sm hover:bg-indigo-600 active:scale-95 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processing && <Spinner className="size-4 animate-spin text-white border-2 border-t-transparent" />}
                                Start My Adventure! ✨
                            </motion.button>
                        </div>

                        {/* Back link */}
                        <div className="text-center text-xs font-bold text-slate-500 dark:text-neutral-400 mt-2">
                            Already have an account?{' '}
                            <TextLink 
                                href={login()} 
                                tabIndex={6}
                                className="text-indigo-500 hover:text-indigo-600 hover:underline font-black"
                            >
                                Log In 🔑
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
