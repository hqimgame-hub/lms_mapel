'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await signIn('credentials', {
                ...data,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === 'CredentialsSignin') {
                    setError('Username, email, atau password salah.');
                } else {
                    setError('Terjadi kesalahan saat mencoba masuk.');
                }
                setIsPending(false);
            } else {
                // Successful login, redirect manually to ensure role-based logic in middleware/auth.config triggers
                router.push('/dashboard');
                router.refresh();
            }
        } catch (e) {
            setError('Gagal menghubungkan ke server.');
            setIsPending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden backdrop-blur-xl">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 dark:from-primary/90 dark:via-blue-700/90 dark:to-blue-800/90 p-10 text-white text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12 blur-2xl"></div>

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative w-24 h-24 flex items-center justify-center bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 shadow-lg">
                                {/* Logo for Light Mode (Dark Logo) */}
                                <Image
                                    src="/images/logo-light.png"
                                    alt="LMS Logo"
                                    width={80}
                                    height={80}
                                    className="dark:hidden object-contain p-3"
                                    priority
                                />
                                {/* Logo for Dark Mode (White Logo) */}
                                <Image
                                    src="/images/logo-dark.png"
                                    alt="LMS Logo"
                                    width={80}
                                    height={80}
                                    className="hidden dark:block object-contain p-3"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-black tracking-tight mb-2">Portal Akademik</h1>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.25em] opacity-90">Learning Management System</p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Username/Email Input */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Username atau Email
                            </label>
                            <input
                                name="identifier"
                                type="text"
                                placeholder="Masukkan username atau email"
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-primary/90 dark:to-blue-700/90 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-6 py-4 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Masuk Ke Sistem
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                            Belum punya akun siswa?{" "}
                            <Link
                                href="/register"
                                className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors"
                            >
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
