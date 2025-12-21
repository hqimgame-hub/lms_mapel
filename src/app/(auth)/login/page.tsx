'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-primary dark:bg-primary/90 p-8 text-white text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="mb-4 flex justify-center">
                            <div className="relative w-full h-12 flex items-center justify-center">
                                {/* Logo for Light Mode (Dark Logo) */}
                                <Image
                                    src="/images/logo-light.png"
                                    alt="LMS Logo"
                                    width={140}
                                    height={40}
                                    className="dark:hidden object-contain"
                                    priority
                                />
                                {/* Logo for Dark Mode (White Logo) */}
                                <Image
                                    src="/images/logo-dark.png"
                                    alt="LMS Logo"
                                    width={140}
                                    height={40}
                                    className="hidden dark:block object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter">Portal Akademik</h1>
                        <p className="text-blue-100/70 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Learning Management System</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Username atau Email</label>
                            <input
                                name="identifier"
                                type="text"
                                placeholder="Masukkan username atau email"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold dark:text-slate-200 shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold dark:text-slate-200 shadow-inner"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-2 animate-shake">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white p-4.5 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-all font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/25 active:scale-[0.98] mt-2 disabled:opacity-50 h-14"
                        >
                            {isPending ? 'Memproses...' : 'Masuk Ke Sistem'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 text-center">
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-tight">
                            Belum punya akun siswa?{" "}
                            <Link href="/register" className="text-primary hover:underline transition-colors ml-1">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
