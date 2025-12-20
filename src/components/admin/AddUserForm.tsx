'use client';

import { createUser } from "@/actions/users";
import { useActionState, useState } from "react";
import { Info, UserPlus, ShieldCheck, GraduationCap, Briefcase } from "lucide-react";

const initialState = {
    message: '',
    success: false,
    errors: undefined as Record<string, string[]> | undefined
};

export function AddUserForm({ classes = [] }: { classes?: { id: string, name: string }[] }) {
    const [state, formAction, isPending] = useActionState(createUser, initialState);
    const [selectedRole, setSelectedRole] = useState('STUDENT');

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <UserPlus size={20} className="text-primary" />
                    Tambah Pengguna Baru
                </h2>
                <form action={formAction} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Nama Lengkap</label>
                            <input
                                name="name"
                                placeholder="Masukkan nama lengkap"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Username</label>
                            <input
                                name="username"
                                placeholder="Username untuk login"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Email (Opsional)</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="alamat@email.com (Kosongkan jika tidak ada)"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Role / Peran</label>
                            <select
                                name="role"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm bg-white"
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
                        <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <GraduationCap size={16} className="text-emerald-500" />
                                Penempatan Kelas
                            </label>
                            <select
                                name="classId"
                                className="border border-emerald-100 bg-emerald-50/30 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
                                required
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1 italic">* Siswa otomatis tergabung ke kelas ini setelah pendaftaran.</p>
                        </div>
                    )}

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                            {state.errors && Object.keys(state.errors).map(key => (
                                <p key={key} className="text-xs mt-1 font-normal">• {key}: {state.errors![key]}</p>
                            ))}
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

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    Penjelasan Role
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg h-fit text-purple-600">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Admin</p>
                            <p className="text-[10px] text-slate-500">Memiliki akses penuh ke seluruh pengaturan sistem dan manajemen data.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                            <Briefcase size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Guru</p>
                            <p className="text-[10px] text-slate-500">Mengelola tugas, memberikan nilai, dan memantau perkembangan siswa di kursus yang diampu.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-green-100 p-2 rounded-lg h-fit text-green-600">
                            <GraduationCap size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">Siswa</p>
                            <p className="text-[10px] text-slate-500">Mengerjakan tugas, melihat nilai, dan mengikuti materi pembelajaran.</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 italic">
                        * Admin dapat membuat akun siswa jika siswa terkendala daftar melalui email mandiri.
                    </p>
                </div>
            </div>
        </div>
    );
}
