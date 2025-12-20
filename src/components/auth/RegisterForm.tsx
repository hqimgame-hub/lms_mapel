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
            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <input
                    name="name"
                    placeholder="Masukkan nama lengkap Anda"
                    className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Pilih Kelas</label>
                <div className="relative">
                    <select
                        name="classId"
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none bg-white"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled>-- Pilih Kelas Anda --</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <School size={18} />
                    </div>
                </div>
                {(() => {
                    const error = state?.errors?.classId;
                    return error ? <p className="text-red-500 text-xs mt-1">{error[0]}</p> : null;
                })()}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Email Utama</label>
                <input
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input
                    name="username"
                    placeholder="Pilih username unik"
                    className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    className="border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                />
            </div>

            {state?.message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${state.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-white p-4 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 font-bold shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
            >
                {isPending ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
        </form>
    );
}
