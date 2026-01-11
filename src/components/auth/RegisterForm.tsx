'use client';

import { registerStudent } from "@/actions/users";
import { useActionState } from "react";
import Link from "next/link";
import { UserPlus, School } from "lucide-react";

const initialState = {
    message: '',
    success: false,
    errors: undefined as Record<string, string[]> | undefined
};

export function RegisterForm({ classes }: { classes: { id: string, name: string }[] }) {
    const [state, formAction, isPending] = useActionState(registerStudent, initialState);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Nama Lengkap</label>
                <input
                    name="name"
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Pilih Kelas</label>
                <div className="relative">
                    <select
                        name="classId"
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 appearance-none cursor-pointer"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled className="dark:bg-slate-900">-- Pilih Kelas Anda --</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id} className="dark:bg-slate-900">
                                {cls.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                        <School size={18} />
                    </div>
                </div>
                {(() => {
                    const error = state?.errors?.classId;
                    return error ? <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">{error[0]}</p> : null;
                })()}
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Utama</label>
                <input
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Username</label>
                <input
                    name="username"
                    placeholder="Pilih username unik"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary dark:focus:border-primary outline-none transition-all text-sm font-semibold dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                />
            </div>

            {state?.message && (
                <div className={`p-4 rounded-xl text-[11px] font-bold flex items-center gap-3 ${state.success ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-500/30'}`}>
                    <span>{state.message}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-primary/90 dark:to-blue-700/90 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-6 py-4 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
                {isPending ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Mendaftarkan...
                    </>
                ) : (
                    <>
                        <UserPlus size={16} />
                        Daftar Sekarang
                    </>
                )}
            </button>
        </form>
    );
}
