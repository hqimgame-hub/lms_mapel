'use client';

import { useState, useActionState, useEffect } from "react";
import { updateStudentByTeacher, saveStudentNote } from "@/actions/users";
import { ActionState } from "@/actions/types";
import { 
    Search, Users, X, KeyRound, User, Mail, Eye, EyeOff, 
    CheckCircle, AlertCircle, Pencil, ChevronDown, 
    Sparkles, Lightbulb, MinusCircle, Tag, Lock, FileText, Check
} from "lucide-react";

export type Student = {
    id: string;
    name: string;
    username: string;
    email: string | null;
    tag?: string | null;
    note?: string | null;
};

export const STUDENT_TAGS = [
    {
        key: 'HIGH_POTENTIAL',
        label: 'Berpotensi',
        shortLabel: 'Berpotensi',
        description: 'Pemahaman cepat, motivasi tinggi, atau potensi unggul',
        icon: Sparkles,
    },
    {
        key: 'NEED_ATTENTION',
        label: 'Butuh Perhatian',
        shortLabel: 'Butuh Perhatian',
        description: 'Memerlukan bimbingan ekstra, remedial, atau intervensi khusus',
        icon: AlertCircle,
    },
    {
        key: 'CREATIVE',
        label: 'Kreatif & Kritis',
        shortLabel: 'Kreatif',
        description: 'Memiliki ide orisinal, daya analisis, dan eksploratif',
        icon: Lightbulb,
    },
    {
        key: 'PASSIVE',
        label: 'Kurang Aktif',
        shortLabel: 'Kurang Aktif',
        description: 'Cenderung pasif, pemalu, atau butuh dorongan percaya diri',
        icon: MinusCircle,
    },
] as const;

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
                            {isPending ? 'Menyimpan...' : state.success ? 'Tersimpan' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TagStudentModal({ 
    student, 
    onClose, 
    onSaved 
}: { 
    student: Student; 
    onClose: () => void;
    onSaved: (studentId: string, tag: string | null, note: string | null) => void;
}) {
    const [selectedTag, setSelectedTag] = useState<string | null>(student.tag ?? null);
    const [noteText, setNoteText] = useState<string>(student.note ?? '');
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setStatus(null);

        try {
            const res = await saveStudentNote(student.id, selectedTag, noteText);
            setStatus(res);
            if (res.success) {
                onSaved(student.id, selectedTag, noteText.trim() ? noteText.trim() : null);
                setTimeout(onClose, 900);
            }
        } catch (err: any) {
            setStatus({ success: false, message: err?.message || "Terjadi kesalahan saat menyimpan catatan." });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Tandai & Catatan Guru</h2>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {student.name} <span className="opacity-70">(@{student.username})</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    {/* Privacy Notice Banner */}
                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs">
                        <Lock size={15} className="flex-shrink-0 mt-0.5 text-slate-500" />
                        <div>
                            <span className="font-bold">Catatan Privat Guru:</span>
                            <span className="ml-1 opacity-90">Tanda dan catatan ini hanya dapat dilihat oleh Anda dan tidak dapat diakses oleh siswa.</span>
                        </div>
                    </div>

                    {/* Tag Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Tag size={11} />
                            Pilih Tanda / Kategori Siswa
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {STUDENT_TAGS.map((t) => {
                                const Icon = t.icon;
                                const isSelected = selectedTag === t.key;
                                return (
                                    <button
                                        type="button"
                                        key={t.key}
                                        onClick={() => setSelectedTag(isSelected ? null : t.key)}
                                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm' 
                                                : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className={`p-1.5 rounded-lg mt-0.5 ${
                                            isSelected 
                                                ? 'bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900' 
                                                : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold">{t.label}</span>
                                                {isSelected && <Check size={12} className="ml-1 flex-shrink-0" />}
                                            </div>
                                            <p className={`text-[10px] mt-0.5 line-clamp-2 leading-relaxed ${
                                                isSelected ? 'opacity-80' : 'text-slate-400 dark:text-slate-400'
                                            }`}>
                                                {t.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedTag && (
                            <div className="flex justify-end mt-1">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTag(null)}
                                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
                                >
                                    <X size={12} />
                                    Hapus Tanda
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notes Textarea */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText size={11} />
                            Catatan Pribadi Guru (Opsional)
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={3}
                            placeholder="Contoh: Sangat cepat memahami materi koding, perlu diberi soal pengayaan. / Sering terkendala kuota/device."
                            className="w-full border border-slate-200 dark:border-slate-800 p-3 rounded-xl focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all text-xs font-medium bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-slate-400 ml-1">
                            Buku saku evaluasi perkembangan belajar siswa untuk persiapan remedial atau pengayaan.
                        </p>
                    </div>

                    {/* Status message */}
                    {status?.message && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all ${
                            status.success
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                        }`}>
                            {status.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                            {status.message}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || status?.success}
                            className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5"
                        >
                            {isPending ? (
                                'Menyimpan...'
                            ) : status?.success ? (
                                <>
                                    <Check size={14} />
                                    Tersimpan
                                </>
                            ) : (
                                'Simpan Tanda & Catatan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function TeacherStudentsClient({ classes }: { classes: ClassGroup[] }) {
    const [classList, setClassList] = useState<ClassGroup[]>(classes);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [taggingStudent, setTaggingStudent] = useState<Student | null>(null);
    const [activeClass, setActiveClass] = useState(classes[0]?.id ?? '');
    const [tagFilter, setTagFilter] = useState<string>('ALL');

    useEffect(() => {
        setClassList(classes);
    }, [classes]);

    const handleStudentSaved = (studentId: string, tag: string | null, note: string | null) => {
        setClassList(prev => prev.map(c => ({
            ...c,
            students: c.students.map(s => s.id === studentId ? { ...s, tag, note } : s)
        })));
    };

    const currentClass = classList.find(c => c.id === activeClass);
    const allStudentsInCurrentClass = currentClass?.students ?? [];

    const filteredStudents = allStudentsInCurrentClass.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                              s.username.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        if (tagFilter === 'ALL') return true;
        if (tagFilter === 'WITH_NOTE') return Boolean(s.note && s.note.trim());
        return s.tag === tagFilter;
    });

    const totalStudents = classList.reduce((acc, c) => acc + c.students.length, 0);
    const totalNeedAttention = classList.reduce((acc, c) => acc + c.students.filter(s => s.tag === 'NEED_ATTENTION').length, 0);
    const totalHighPotential = classList.reduce((acc, c) => acc + c.students.filter(s => s.tag === 'HIGH_POTENTIAL').length, 0);

    const countHighPotentialInClass = allStudentsInCurrentClass.filter(s => s.tag === 'HIGH_POTENTIAL').length;
    const countNeedAttentionInClass = allStudentsInCurrentClass.filter(s => s.tag === 'NEED_ATTENTION').length;
    const countCreativeInClass = allStudentsInCurrentClass.filter(s => s.tag === 'CREATIVE').length;
    const countPassiveInClass = allStudentsInCurrentClass.filter(s => s.tag === 'PASSIVE').length;
    const countWithNotesInClass = allStudentsInCurrentClass.filter(s => Boolean(s.note && s.note.trim())).length;

    if (classList.length === 0) {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalStudents}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Total Siswa</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalNeedAttention}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Butuh Perhatian</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalHighPotential}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Berpotensi</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{classList.length}</p>
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
                            onChange={e => { setActiveClass(e.target.value); setSearch(''); setTagFilter('ALL'); }}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm px-4 py-3 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all cursor-pointer"
                        >
                            {classList.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    Kelas {cls.name} — {cls.students.length} siswa
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Search bar & Tag Filters */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Cari nama atau username di Kelas ${currentClass?.name}...`}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills (Monochrome) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline flex-shrink-0">
                            Filter:
                        </span>

                        <button
                            onClick={() => setTagFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'ALL'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <span>Semua</span>
                            <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                {allStudentsInCurrentClass.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setTagFilter('HIGH_POTENTIAL')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'HIGH_POTENTIAL'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Sparkles size={12} />
                            <span>Berpotensi</span>
                            {countHighPotentialInClass > 0 && (
                                <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                    {countHighPotentialInClass}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setTagFilter('NEED_ATTENTION')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'NEED_ATTENTION'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <AlertCircle size={12} />
                            <span>Butuh Perhatian</span>
                            {countNeedAttentionInClass > 0 && (
                                <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                    {countNeedAttentionInClass}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setTagFilter('CREATIVE')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'CREATIVE'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Lightbulb size={12} />
                            <span>Kreatif</span>
                            {countCreativeInClass > 0 && (
                                <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                    {countCreativeInClass}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setTagFilter('PASSIVE')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'PASSIVE'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <MinusCircle size={12} />
                            <span>Kurang Aktif</span>
                            {countPassiveInClass > 0 && (
                                <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                    {countPassiveInClass}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setTagFilter('WITH_NOTE')}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                tagFilter === 'WITH_NOTE'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <FileText size={12} />
                            <span>Ada Catatan</span>
                            {countWithNotesInClass > 0 && (
                                <span className="text-[10px] opacity-75 font-black px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                                    {countWithNotesInClass}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Student list */}
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="font-bold text-sm">
                                {search || tagFilter !== 'ALL' ? 'Siswa tidak ditemukan untuk filter ini' : 'Tidak ada siswa di kelas ini'}
                            </p>
                        </div>
                    ) : (
                        filteredStudents.map((student, i) => {
                            const tagConfig = STUDENT_TAGS.find(t => t.key === student.tag);
                            const TagIcon = tagConfig ? tagConfig.icon : null;

                            return (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm">
                                        {student.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                                {student.name}
                                            </p>

                                            {/* Tag Badge (Monochrome) */}
                                            {tagConfig && TagIcon && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                                    <TagIcon size={11} className="text-slate-500 dark:text-slate-400" />
                                                    {tagConfig.shortLabel}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[11px] text-slate-400 font-medium">@{student.username}</span>
                                            {student.email && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700">·</span>
                                                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">{student.email}</span>
                                                </>
                                            )}
                                            {!student.email && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700">·</span>
                                                    <span className="text-[11px] text-amber-500 font-bold">Tidak ada email</span>
                                                </>
                                            )}

                                            {/* Private Note Preview Button */}
                                            {student.note && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700">·</span>
                                                    <button
                                                        onClick={() => setTaggingStudent(student)}
                                                        title={`Catatan Guru: ${student.note}`}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-colors max-w-[180px] sm:max-w-xs truncate"
                                                    >
                                                        <FileText size={10} className="text-slate-400 flex-shrink-0" />
                                                        <span className="truncate">{student.note}</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nomor urut */}
                                    <span className="text-[11px] font-black text-slate-300 dark:text-slate-700 w-6 text-center hidden md:block">{i + 1}</span>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {/* Tag / Note Button */}
                                        <button
                                            onClick={() => setTaggingStudent(student)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-95"
                                            title="Tandai siswa atau tulis catatan privat"
                                        >
                                            <Tag size={13} />
                                            <span className="hidden sm:inline">Tandai</span>
                                        </button>

                                        {/* Edit Student Account Button */}
                                        <button
                                            onClick={() => setEditingStudent(student)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all active:scale-95"
                                            title="Edit nama/email atau reset password"
                                        >
                                            <Pencil size={13} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredStudents.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold">
                        Menampilkan {filteredStudents.length} dari {currentClass?.students.length} siswa
                    </div>
                )}
            </div>

            {/* Tag / Note Modal */}
            {taggingStudent && (
                <TagStudentModal
                    student={taggingStudent}
                    onClose={() => setTaggingStudent(null)}
                    onSaved={handleStudentSaved}
                />
            )}

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
