'use client';

import { updateCourse } from "@/actions/courses";
import { ActionState } from "@/actions/types";
import { useActionState, useState, useEffect } from "react";
import { Layers, Edit, X } from "lucide-react";

interface EditCourseModalProps {
    course: {
        id: string;
        classId: string;
        subjectId: string;
        teacherId: string;
    };
    classes: { id: string, name: string }[];
    subjects: { id: string, name: string }[];
    teachers: { id: string, name: string }[];
}

export function EditCourseModal({ course, classes, subjects, teachers }: EditCourseModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateCourse, { success: false, message: '', errors: undefined } as ActionState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-blue-500 hover:text-blue-700"
                title="Edit Alokasi"
            >
                <Edit size={18} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Layers size={18} />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">Edit Alokasi Kursus</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-5 space-y-3.5">
                    <input type="hidden" name="id" value={course.id} />

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kelas</label>
                        <select
                            name="classId"
                            defaultValue={course.classId}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            required
                        >
                            {classes.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mata Pelajaran</label>
                        <select
                            name="subjectId"
                            defaultValue={course.subjectId}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            required
                        >
                            {subjects.map(s => <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Guru Pengajar</label>
                        <select
                            name="teacherId"
                            defaultValue={course.teacherId}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                            required
                        >
                            {teachers.map(t => <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.name}</option>)}
                        </select>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border transition-all ${state.success ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
                            {state.message}
                            {state.errors && (
                                <ul className="mt-1 divide-y divide-current/10">
                                    {Object.keys(state.errors).map(key => (
                                        <li key={key} className="py-1 opacity-80 font-medium tracking-tight">
                                            {Array.isArray(state.errors?.[key]) ? state.errors?.[key].join(', ') : state.errors?.[key]}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
