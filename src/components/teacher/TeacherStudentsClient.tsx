'use client';

import { useState, useActionState, useEffect } from "react";
import { updateStudentByTeacher } from "@/actions/users";
import { ActionState } from "@/actions/types";
import { Search, Users, X, KeyRound, User, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Pencil, ChevronDown } from "lucide-react";

type Student = {
    id: string;
    name: string;
    username: string;
    email: string | null;
};

type ClassGroup = {
    id: string;
    name: string;
    students: Student[];
};

const initialState: ActionState = { message: '', success: false, errors: undefined };

function EditStudentModal({ student, onClose }: { student: Student; onClose: () => void }) {
    const [state, formAction, isPending] = useActionState(updateStudentByTeacher, initialState);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (state.success) {
            const t = setTimeout(onClose, 1200);
            return () => clearTimeout(t);
        }
    }, [state.success, onClose]);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                            {student.name[0]}
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Edit Akun Siswa</h2>
                            <p className="text-[10px] text-slate-400 font-medium">@{student.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 flex flex-col gap-4">
                    <input type="hidden" name="studentId" value={student.id} />

                    {/* Nama */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <User size={11} />
                            Nama Lengkap
                        </label>
                        <input
                            name="name"
                            defaultValue={student.name}
                            placeholder="Nama lengkap siswa"
                            required
                            className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        />
                        {state.errors?.name && (
                            <p className="text-[10px] text-red-500 font-medium ml-1">{state.errors.name[0]}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Mail size={11} />
                            Email (Opsional)
                        </label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={student.email ?? ''}
                            placeholder="Kosongkan jika tidak ada email"
                            className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        />
                        {state.errors?.email && (
                            <p className="text-[10px] text-red-500 font-medium ml-1">{state.errors.email[0]}</p>
                        )}
                    </div>

                    {/* Reset Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <KeyRound size={11} />
                            Password Baru (Opsional)
                        </label>
                        <div className="relative">
                            <input
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Kosongkan jika tidak ingin reset"
                                className="w-full border border-slate-200 dark:border-slate-800 p-3 pr-10 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {state.errors?.newPassword && (
                            <p className="text-[10px] text-red-500 font-medium ml-1">{state.errors.newPassword[0]}</p>
                        )}
                        <p className="text-[10px] text-slate-400 ml-1">Minimal 6 karakter. Biarkan kosong jika tidak ingin mengubah password.</p>
                    </div>

                    {/* Status message */}
                    {state.message && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${state.success
                            ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}>
                            {state.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || state.success}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-blue-500/20"
                        >
                            {isPending ? 'Menyimpan...' : state.success ? 'Tersimpan ✓' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function TeacherStudentsClient({ classes }: { classes: ClassGroup[] }) {
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [activeClass, setActiveClass] = useState(classes[0]?.id ?? '');

    const currentClass = classes.find(c => c.id === activeClass);
    const filteredStudents = currentClass?.students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);

    if (classes.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <Users size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">Anda belum memiliki kelas.</p>
                <p className="text-sm mt-1">Hubungi admin untuk mengalokasikan kursus.</p>
            </div>
        );
    }

    return (
        <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Users size={22} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalStudents}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Total Siswa</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{classes.length}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Kelas Diampu</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Class dropdown */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <select
                            value={activeClass}
                            onChange={e => { setActiveClass(e.target.value); setSearch(''); }}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm px-4 py-3 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    Kelas {cls.name} — {cls.students.length} siswa
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Search bar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Cari nama atau username di Kelas ${currentClass?.name}...`}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Student list */}
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="font-bold text-sm">{search ? 'Siswa tidak ditemukan' : 'Tidak ada siswa di kelas ini'}</p>
                        </div>
                    ) : (
                        filteredStudents.map((student, i) => (
                            <div
                                key={student.id}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-blue-500/20">
                                    {student.name[0]}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] text-slate-400 font-medium">@{student.username}</span>
                                        {student.email && (
                                            <>
                                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                                <span className="text-[11px] text-slate-400 font-medium truncate">{student.email}</span>
                                            </>
                                        )}
                                        {!student.email && (
                                            <>
                                                <span className="text-slate-300 dark:text-slate-700">·</span>
                                                <span className="text-[11px] text-amber-500 font-bold">Tidak ada email</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Nomor urut */}
                                <span className="text-[11px] font-black text-slate-300 dark:text-slate-700 w-6 text-center hidden sm:block">{i + 1}</span>

                                {/* Edit button */}
                                <button
                                    onClick={() => setEditingStudent(student)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all opacity-0 group-hover:opacity-100 active:scale-95 flex-shrink-0"
                                >
                                    <Pencil size={13} />
                                    Edit
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {filteredStudents.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold">
                        Menampilkan {filteredStudents.length} dari {currentClass?.students.length} siswa
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                />
            )}
        </>
    );
}
