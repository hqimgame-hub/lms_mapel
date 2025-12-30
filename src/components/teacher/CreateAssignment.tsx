'use client';

import { createAssignment } from "@/actions/assignments";
import { ActionState } from "@/actions/types";
import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";

export function CreateAssignment({
    courseId,
    teacherCourses
}: {
    courseId?: string,
    teacherCourses?: { id: string, name: string }[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState<string[]>(courseId ? [courseId] : []);
    const [state, formAction, isPending] = useActionState(createAssignment, { message: '', success: false, errors: undefined } as ActionState);

    // Close on success
    if (state.success && isOpen) {
        setIsOpen(false);
        setSelectedCourses(courseId ? [courseId] : []);
    }

    const toggleCourse = (id: string) => {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition shadow-md font-bold text-sm"
            >
                <Plus size={20} />
                Buat Tugas Baru
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus size={18} />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">Buat Tugas Baru</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
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
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900"
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
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Tugas</label>
                        <input name="title" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner" placeholder="E.g. Latihan Bab 1" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
                        <textarea name="description" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[60px]" rows={2} placeholder="Instruksi..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tenggat Waktu</label>
                        <input name="dueDate" type="datetime-local" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300" required />
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
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900"
                            />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                                Tampilkan ke Siswa?
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || selectedCourses.length === 0}
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
