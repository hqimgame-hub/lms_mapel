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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-xl text-slate-800">Buat Tugas Baru</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form action={formAction} className="p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                    {/* Course Selection */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Pilih Kelas Tujuan</label>
                        {teacherCourses ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                {teacherCourses.map(course => (
                                    <label key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 group">
                                        <input
                                            type="checkbox"
                                            name="courseIds"
                                            value={course.id}
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => toggleCourse(course.id)}
                                            className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{course.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input type="hidden" name="courseIds" value={courseId} />
                        )}
                        {selectedCourses.length === 0 && (
                            <p className="text-amber-600 text-[10px] font-bold">Harap pilih minimal satu kelas.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Judul Tugas</label>
                        <input name="title" className="bg-slate-50 border-none rounded-2xl p-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Contoh: Latihan Bab 1 - Struktur Atom" required />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Deskripsi (Opsional)</label>
                        <textarea name="description" className="bg-slate-50 border-none rounded-2xl p-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all font-medium" rows={3} placeholder="Instruksi pengerjaan tugas..." />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Tenggat Waktu</label>
                        <input name="dueDate" type="datetime-local" className="bg-slate-50 border-none rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-primary/20 transition-all font-medium" required />
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${state.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {state.message}
                            {(state as any).errors && Object.keys((state as any).errors).map(key => {
                                const errorList = (state as any).errors?.[key];
                                if (!errorList) return null;
                                return (
                                    <p key={key} className="mt-1 flex items-center gap-1 font-normal">• {key}: {Array.isArray(errorList) ? errorList.join(', ') : errorList}</p>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || selectedCourses.length === 0}
                            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:grayscale transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan & Bagikan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
