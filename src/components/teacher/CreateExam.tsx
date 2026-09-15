'use client';

import { useState, useEffect, useActionState } from "react";
import { Plus, X, Link as LinkIcon } from "lucide-react";
import { createExam } from "@/actions/exams";

interface CreateExamModalProps {
    courseId?: string;
    teacherCourses?: { id: string, name: string }[];
    onClose: () => void;
}

function CreateExamModal({
    courseId,
    teacherCourses,
    onClose
}: CreateExamModalProps) {
    const [selectedCourses, setSelectedCourses] = useState<string[]>(courseId ? [courseId] : []);
    const [state, formAction, isPending] = useActionState(createExam, { message: '', success: false, errors: undefined as Record<string, string[]> | undefined });

    // Close on success
    useEffect(() => {
        if (state?.success) {
            onClose();
        }
    }, [state?.success, onClose]);

    const toggleCourse = (id: string) => {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-purple-600 dark:bg-purple-600/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus size={18} />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">Buat Ujian Baru</h3>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                    {/* Course Selection */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Kelas Tujuan</label>
                        {teacherCourses ? (
                            <div className="grid grid-cols-1 gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                {teacherCourses.map(course => (
                                    <label key={course.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="courseIds"
                                            value={course.id}
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => toggleCourse(course.id)}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 dark:bg-slate-900"
                                        />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{course.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input type="hidden" name="courseIds" value={courseId} />
                        )}
                        {selectedCourses.length === 0 && (
                            <p className="text-amber-600 text-[9px] font-black uppercase ml-1">Pilih minimal satu kelas.</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Ujian</label>
                        <input name="title" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner" placeholder="E.g. Ulangan Harian 1" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi / Petunjuk</label>
                        <textarea name="description" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[60px]" rows={2} placeholder="Kerjakan soal dengan teliti..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Link Ujian Eksternal</label>
                        <div className="relative">
                            <input name="externalUrl" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 pl-9 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-400" placeholder="https://forms.google.com/..." required />
                            <LinkIcon size={14} className="absolute left-3 top-3.5 text-slate-400" />
                        </div>
                        <p className="text-[9px] text-slate-400 ml-1">Bisa berupa Google Form, Quizizz, atau platform ujian lainnya.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mulai Ujian</label>
                            <input name="startTime" type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Selesai Ujian</label>
                            <input name="endTime" type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                        <input name="duration" type="number" min="1" defaultValue="60" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-300" required />
                    </div>

                    {state?.message && (
                        <div className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${state.success ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                            <input
                                type="checkbox"
                                name="published"
                                value="on"
                                defaultChecked
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 dark:bg-slate-900"
                            />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                                Tampilkan ke Siswa?
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || selectedCourses.length === 0}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-500 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CreateExam({
    courseId,
    teacherCourses
}: {
    courseId?: string,
    teacherCourses?: { id: string, name: string }[]
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition shadow-md font-bold text-sm"
            >
                <Plus size={20} />
                Buat Ujian Baru
            </button>

            {isOpen && (
                <CreateExamModal
                    courseId={courseId}
                    teacherCourses={teacherCourses}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
