import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { motion } from 'framer-motion';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Welcome to BitByWorld! 🌍"
            description="Log in to start your adventure!"
        >
            <Head title="Log In" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            
                            {/* Email Input */}
                            <div className="grid gap-1.5">
                                <label 
                                    htmlFor="email" 
                                    className="text-xs font-black text-slate-600 dark:text-neutral-300 ml-1"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="your-name@email.com"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Input */}
                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label 
                                        htmlFor="password" 
                                        className="text-xs font-black text-slate-600 dark:text-neutral-300"
                                    >
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border-2 border-slate-100 hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 transition-all font-semibold"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember checkbox */}
                            <div className="flex items-center space-x-2.5 ml-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-lg border-2 border-slate-200 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                />
                                <label 
                                    htmlFor="remember" 
                                    className="text-xs font-bold text-slate-500 dark:text-neutral-400 select-none cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>

                            {/* Log in Button */}
                            <motion.button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                whileTap={{ scale: 0.97 }}
                                className="mt-2 w-full rounded-2xl bg-indigo-500 py-3.5 text-white font-black text-sm hover:bg-indigo-600 active:scale-95 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processing && <Spinner className="size-4 animate-spin text-white border-2 border-t-transparent" />}
                                Let's Play! 🚀
                            </motion.button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-xs font-bold text-slate-500 dark:text-neutral-400 mt-2">
                                Don't have an explorer account?{' '}
                                <TextLink 
                                    href={register()} 
                                    tabIndex={5} 
                                    className="text-indigo-500 hover:text-indigo-600 hover:underline font-black"
                                >
                                    Sign Up 🎒
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-2xl">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
