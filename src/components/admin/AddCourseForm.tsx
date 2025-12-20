'use client';

import { createCourse } from "@/actions/courses";
import { useActionState } from "react";
import { Info, Layers, UserCircle, BookOpen, Presentation } from "lucide-react";

interface AddCourseFormProps {
    classes: any[];
    subjects: any[];
    teachers: any[];
}

const initialState = {
    message: '',
    success: false,
    errors: undefined as Record<string, string[]> | undefined
};

export function AddCourseForm({ classes, subjects, teachers }: AddCourseFormProps) {
    const [state, formAction, isPending] = useActionState(createCourse, initialState);

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-800">
            <div className="md:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers size={20} className="text-primary" />
                    Buat Alokasi Kursus Baru
                </h2>
                <form action={formAction} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <Presentation size={16} className="text-slate-400" /> Pilih Kelas
                        </label>
                        <select name="classId" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm" required>
                            <option value="">-- Pilih Kelas --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <BookOpen size={16} className="text-slate-400" /> Pilih Mata Pelajaran
                        </label>
                        <select name="subjectId" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm" required>
                            <option value="">-- Pilih Mata Pelajaran --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold flex items-center gap-2">
                            <UserCircle size={16} className="text-slate-400" /> Pilih Guru Pengajar
                        </label>
                        <select name="teacherId" className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-sm" required>
                            <option value="">-- Pilih Guru --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {state?.message && (
                        <div className={`text-sm p-3 rounded-lg ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-white p-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 font-semibold shadow-md active:scale-[0.98]"
                    >
                        {isPending ? 'Menyimpan...' : 'Simpan Alokasi'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    Apa itu Alokasi?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Alokasi kursus adalah proses **menghubungkan** antara Kelas, Mata Pelajaran, dan Guru.
                </p>
                <ul className="text-[11px] text-slate-500 space-y-3">
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">1.</span>
                        Siswa di kelas yang dipilih akan otomatis melihat kursus ini di dashboard mereka.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">2.</span>
                        Guru yang dipilih akan memiliki wewenang penuh untuk membuat tugas dan memberikan nilai pada kursus ini.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">3.</span>
                        Satu mata pelajaran hanya bisa dialokasikan satu kali per kelas.
                    </li>
                </ul>
            </div>
        </div>
    );
}
