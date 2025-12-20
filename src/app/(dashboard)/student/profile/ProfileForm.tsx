'use client';

import { updateProfile } from "@/actions/users";
import { useActionState } from "react";
import { User, Mail, Lock, ShieldCheck, Save } from "lucide-react";

export default function StudentProfilePage({ userEmail, userName }: { userEmail: string, userName: string }) {
    const [state, formAction, isPending] = useActionState(updateProfile, { message: '', success: false });

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Profil ⚙️</h1>
                <p className="text-slate-500 font-medium">Kelola informasi akun dan keamanan kata sandi Anda.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                        {userName.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{userName}</h2>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/10 px-3 py-1 rounded-full">Siswa Terdaftar</span>
                    </div>
                </div>

                <form action={formAction} className="p-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap (Read-only)</label>
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-500 font-bold">
                            <User size={18} />
                            <span>{userName}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Utama</label>
                        <div className="relative">
                            <input
                                name="email"
                                type="email"
                                defaultValue={userEmail}
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="nama@email.com"
                                required
                            />
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                        <div className="relative">
                            <input
                                name="password"
                                type="password"
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="•••••••• (Kosongkan jika tidak ingin ganti)"
                            />
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi</label>
                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type="password"
                                className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-200 ${state.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center justify-center gap-3 bg-primary text-white p-5 rounded-2xl font-black tracking-tight hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 active:scale-[0.98]"
                    >
                        <Save size={20} />
                        {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </form>
            </div>
        </div>
    );
}
