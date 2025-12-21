'use client';

import { createUser } from "@/actions/users";
import { ActionState } from "@/actions/types";
import { useActionState, useState } from "react";
import { Info, UserPlus, ShieldCheck, GraduationCap, Briefcase } from "lucide-react";

const initialState: ActionState = {
    message: '',
    success: false,
    errors: undefined
};

export function AddUserForm({ classes = [] }: { classes?: { id: string, name: string }[] }) {
    const [state, formAction, isPending] = useActionState(createUser, initialState);
    const [selectedRole, setSelectedRole] = useState('STUDENT');

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-8 transition-colors">
            <div className="md:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    <UserPlus size={20} className="text-primary" />
                    Tambah Pengguna Baru
                </h2>
                <form action={formAction} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <input
                                name="name"
                                placeholder="Masukkan nama lengkap"
                                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <input
                                name="username"
                                placeholder="Username untuk login"
                                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Opsional)</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="alamat@email.com (Kosongkan jika tidak ada)"
                                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role / Peran</label>
                            <select
                                name="role"
                                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="STUDENT">Siswa</option>
                                <option value="TEACHER">Guru</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    </div>

                    {selectedRole === 'STUDENT' && (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <GraduationCap size={14} className="text-emerald-500" />
                                Penempatan Kelas
                            </label>
                            <select
                                name="classId"
                                className="border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/20 p-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-black text-slate-800 dark:text-emerald-400 dark:bg-emerald-500/5"
                                required
                            >
                                <option value="">-- Pilih Kelas Untuk Siswa --</option>
                                {classes.length > 0 ? (
                                    classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>Tidak ada kelas tersedia</option>
                                )}
                            </select>
                            {classes.length === 0 && (
                                <p className="text-[10px] text-red-500 font-bold ml-1">
                                    Peringatan: Tidak ada data kelas di sistem. Ke tab "Kelas" untuk membuat.
                                </p>
                            )}
                        </div>
                    )}

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                            {state.errors && Object.keys(state.errors).map(key => {
                                const errorList = state.errors?.[key];
                                if (!errorList) return null;
                                return (
                                    <p key={key} className="text-xs mt-1 font-normal">• {key}: {errorList.join(', ')}</p>
                                );
                            })}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-white p-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 font-semibold shadow-md active:scale-[0.98]"
                    >
                        {isPending ? 'Memproses...' : 'Buat Pengguna'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-fit transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    Penjelasan Role
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg h-fit text-purple-600">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Admin</p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Memiliki akses penuh ke seluruh pengaturan sistem dan manajemen data.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                            <Briefcase size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Guru</p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Mengelola tugas, memberikan nilai, dan memantau perkembangan siswa di kursus yang diampu.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-green-100 p-2 rounded-lg h-fit text-green-600">
                            <GraduationCap size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Siswa</p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Mengerjakan tugas, melihat nilai, dan mengikuti materi pembelajaran.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 italic leading-relaxed">
                        * Admin dapat membuat akun siswa jika siswa terkendala daftar melalui email mandiri.
                    </p>
                </div>
            </div>
        </div>
    );
}
