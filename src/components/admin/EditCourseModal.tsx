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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-primary p-4 text-white flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <Layers size={20} />
                        Edit Alokasi Kursus
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={course.id} />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kelas</label>
                        <select
                            name="classId"
                            defaultValue={course.classId}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            required
                        >
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</label>
                        <select
                            name="subjectId"
                            defaultValue={course.subjectId}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            required
                        >
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Guru Pengajar</label>
                        <select
                            name="teacherId"
                            defaultValue={course.teacherId}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                            required
                        >
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {state?.message && (
                        <div className={`text-sm p-3 rounded-xl ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                            {state.errors && Object.keys(state.errors).map(key => {
                                const errorList = state.errors?.[key];
                                if (!errorList) return null;
                                return (
                                    <p key={key} className="text-xs mt-1 font-normal">• {key}: {Array.isArray(errorList) ? errorList.join(', ') : errorList}</p>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
