'use client';

import { useState, useActionState, useEffect, useTransition, useMemo } from "react";
import { updateStudentByTeacher, deleteStudentByTeacher } from "@/actions/users";
import { ActionState } from "@/actions/types";
import {
    Search, Users, X, KeyRound, User, Mail, Eye, EyeOff,
    CheckCircle, AlertCircle, Pencil, ChevronDown, Trash2,
    AlertTriangle, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

type Student = {
    id: string;
    name: string;
    username: string;
    email: string | null;
    _count?: {
        submissions: number;
    };
};

type ClassGroup = {
    id: string;
    name: string;
    students: Student[];
};

const initialState: ActionState = { message: '', success: false, errors: undefined };

function EditStudentModal({
    student,
    onClose,
    onUpdated
}: {
    student: Student;
    onClose: () => void;
    onUpdated: (studentId: string, updated: { name: string; email: string | null }) => void;
}) {
    const [state, formAction, isPending] = useActionState(updateStudentByTeacher, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState(student.name);
    const [email, setEmail] = useState(student.email ?? '');

    useEffect(() => {
        if (state.success) {
            onUpdated(student.id, { name, email: email || null });
            const t = setTimeout(onClose, 1000);
            return () => clearTimeout(t);
        }
    }, [state.success, onClose, onUpdated, student.id, name, email]);

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
                            value={name}
                            onChange={e => setName(e.target.value)}
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
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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

function DeleteStudentModal({
    student,
    className,
    onClose,
    onDeleted,
}: {
    student: Student;
    className: string;
    onClose: () => void;
    onDeleted: (studentId: string, message: string) => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const submissionCount = student._count?.submissions ?? 0;

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            const res = await deleteStudentByTeacher(student.id);
            if (res.success) {
                onDeleted(student.id, res.message || `Akun ${student.name} berhasil dihapus.`);
                onClose();
            } else {
                setError(res.message || "Gagal menghapus akun siswa.");
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Hapus Akun Siswa</h2>
                            <p className="text-[11px] text-slate-400 font-medium">Kelas {className}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {/* Student Info Card */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-500/20 flex-shrink-0">
                            {student.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{student.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate">@{student.username} {student.email ? `• ${student.email}` : ''}</p>
                        </div>
                    </div>

                    {/* Submission status alert */}
                    {submissionCount === 0 ? (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Aman untuk dihapus (0 Tugas)</p>
                                <p className="opacity-85 mt-0.5">Akun ini belum pernah mengumpulkan tugas atau ujian apa pun. Cocok jika ini adalah akun kloningan / duplikat.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Perhatian: Memiliki {submissionCount} Riwayat Tugas</p>
                                <p className="opacity-85 mt-0.5">
                                    Akun ini sudah memiliki <strong>{submissionCount}</strong> data tugas. Jika dihapus, seluruh riwayat tugas & nilai siswa ini akan ikut terhapus permanen.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Tindakan ini tidak dapat dibatalkan. Pastikan akun ini memang akun yang salah atau duplikat sebelum menghapusnya.
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold">
                            <AlertCircle size={15} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Menghapus...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 size={15} />
                                    <span>Hapus Akun</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TeacherStudentsClient({ classes: initialClasses }: { classes: ClassGroup[] }) {
    const router = useRouter();
    const [classes, setClasses] = useState<ClassGroup[]>(initialClasses);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // Keep classes in sync if props change
    useEffect(() => {
        setClasses(initialClasses);
    }, [initialClasses]);

    const [activeClass, setActiveClass] = useState(classes[0]?.id ?? '');

    // Ensure activeClass is valid
    useEffect(() => {
        if (!classes.find(c => c.id === activeClass) && classes[0]?.id) {
            setActiveClass(classes[0].id);
        }
    }, [classes, activeClass]);

    const currentClass = classes.find(c => c.id === activeClass);

    // Hitung kemunculan nama untuk mendeteksi potensi akun duplikat
    const duplicateNames = useMemo(() => {
        const counts = new Map<string, number>();
        currentClass?.students.forEach(s => {
            const cleanName = s.name.trim().toLowerCase();
            counts.set(cleanName, (counts.get(cleanName) || 0) + 1);
        });
        return counts;
    }, [currentClass]);

    const duplicateCount = useMemo(() => {
        let count = 0;
        currentClass?.students.forEach(s => {
            const cleanName = s.name.trim().toLowerCase();
            if ((duplicateNames.get(cleanName) || 0) > 1) {
                count++;
            }
        });
        return count;
    }, [currentClass, duplicateNames]);

    const filteredStudents = useMemo(() => {
        if (!currentClass) return [];
        return currentClass.students.filter(s => {
            const matchesSearch =
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.username.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearch) return false;

            if (filterDuplicatesOnly) {
                const cleanName = s.name.trim().toLowerCase();
                return (duplicateNames.get(cleanName) || 0) > 1;
            }

            return true;
        });
    }, [currentClass, search, filterDuplicatesOnly, duplicateNames]);

    const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);

    const handleStudentDeleted = (deletedId: string, message: string) => {
        setClasses(prev => prev.map(c => ({
            ...c,
            students: c.students.filter(s => s.id !== deletedId)
        })));
        setFeedbackMessage(message);
        setTimeout(() => setFeedbackMessage(null), 4000);
        router.refresh();
    };

    const handleStudentUpdated = (studentId: string, updated: { name: string; email: string | null }) => {
        setClasses(prev => prev.map(c => ({
            ...c,
            students: c.students.map(s => s.id === studentId ? { ...s, ...updated } : s)
        })));
        router.refresh();
    };

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
            {/* Feedback alert after action */}
            {feedbackMessage && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={18} className="flex-shrink-0" />
                    <span>{feedbackMessage}</span>
                </div>
            )}

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
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
                {duplicateCount > 0 && (
                    <div className="col-span-2 md:col-span-1 bg-amber-50/70 dark:bg-amber-500/10 rounded-[1.5rem] border border-amber-200/70 dark:border-amber-500/20 p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                            <AlertTriangle size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{duplicateCount}</p>
                            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-bold uppercase tracking-wide">Indikasi Duplikat</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Class dropdown */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <select
                            value={activeClass}
                            onChange={e => { setActiveClass(e.target.value); setSearch(''); setFilterDuplicatesOnly(false); }}
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

                {/* Duplicate Notification & Quick Filter Banner */}
                {duplicateCount > 0 && (
                    <div className="px-5 py-3 bg-amber-50/60 dark:bg-amber-500/10 border-b border-amber-200/50 dark:border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                            <AlertTriangle size={15} className="flex-shrink-0" />
                            <span>
                                Ada <strong>{duplicateCount} akun</strong> dengan kemiripan nama di kelas ini. Periksa jumlah tugas sebelum menghapus.
                            </span>
                        </div>
                        <button
                            onClick={() => setFilterDuplicatesOnly(prev => !prev)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                                filterDuplicatesOnly
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/30'
                            }`}
                        >
                            {filterDuplicatesOnly ? 'Tampilkan Semua Siswa' : 'Filter Hanya Akun Duplikat'}
                        </button>
                    </div>
                )}

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
                            <p className="font-bold text-sm">
                                {filterDuplicatesOnly
                                    ? 'Tidak ada akun duplikat yang cocok dengan pencarian'
                                    : search
                                    ? 'Siswa tidak ditemukan'
                                    : 'Tidak ada siswa di kelas ini'}
                            </p>
                        </div>
                    ) : (
                        filteredStudents.map((student, i) => {
                            const isDuplicate = (duplicateNames.get(student.name.trim().toLowerCase()) || 0) > 1;
                            const submissionCount = student._count?.submissions ?? 0;

                            return (
                                <div
                                    key={student.id}
                                    className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group ${
                                        isDuplicate ? 'bg-amber-50/20 dark:bg-amber-500/[0.03]' : ''
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md ${
                                        isDuplicate
                                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                                            : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/20'
                                    }`}>
                                        {student.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
                                            {isDuplicate && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/70 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                                    <AlertTriangle size={10} />
                                                    Nama Serupa
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[11px] text-slate-400 font-medium">@{student.username}</span>
                                            {student.email ? (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700">·</span>
                                                    <span className="text-[11px] text-slate-400 font-medium truncate">{student.email}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700">·</span>
                                                    <span className="text-[11px] text-amber-500 font-bold">Tidak ada email</span>
                                                </>
                                            )}
                                            <span className="text-slate-300 dark:text-slate-700">·</span>
                                            <span className={`text-[11px] font-semibold ${
                                                submissionCount > 0
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {submissionCount} tugas
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nomor urut */}
                                    <span className="text-[11px] font-black text-slate-300 dark:text-slate-700 w-6 text-center hidden sm:block">{i + 1}</span>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0">
                                        <button
                                            onClick={() => setEditingStudent(student)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95"
                                            title="Edit profil atau reset password"
                                        >
                                            <Pencil size={13} />
                                            <span className="hidden md:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => setDeletingStudent(student)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95"
                                            title="Hapus akun siswa"
                                        >
                                            <Trash2 size={13} />
                                            <span className="hidden md:inline">Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredStudents.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold flex justify-between items-center">
                        <span>Menampilkan {filteredStudents.length} dari {currentClass?.students.length} siswa</span>
                        {filterDuplicatesOnly && (
                            <span className="text-amber-600 dark:text-amber-400">Filter duplikat aktif</span>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                    onUpdated={handleStudentUpdated}
                />
            )}

            {/* Delete Modal */}
            {deletingStudent && currentClass && (
                <DeleteStudentModal
                    student={deletingStudent}
                    className={currentClass.name}
                    onClose={() => setDeletingStudent(null)}
                    onDeleted={handleStudentDeleted}
                />
            )}
        </>
    );
}
