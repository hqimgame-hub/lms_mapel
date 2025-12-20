'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';
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
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-primary p-8 text-white text-center">
                    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                        <LogIn size={24} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">Login TIK & KKA</h1>
                    <p className="text-blue-100 text-xs mt-1 font-medium opacity-80 uppercase tracking-widest">Learning Management System</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Username atau Email</label>
                            <input
                                name="identifier"
                                type="text"
                                placeholder="Masukkan username atau email"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary text-white p-4 rounded-2xl hover:bg-blue-600 transition-all font-bold shadow-lg shadow-primary/25 active:scale-[0.98] mt-2 disabled:opacity-50"
                        >
                            {isPending ? 'Memproses...' : 'Masuk Ke Sistem'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-xs font-semibold">
                            Belum punya akun siswa?{" "}
                            <Link href="/register" className="text-primary hover:text-blue-700 transition-colors ml-1">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
