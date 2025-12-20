'use client';

import { createSubject } from "@/actions/subjects";
import { useActionState } from "react";
import { Info, BookPlus } from "lucide-react";

const initialState = {
    message: '',
    success: false,
    errors: undefined as Record<string, string[]> | undefined
};

export function AddSubjectForm() {
    const [state, formAction, isPending] = useActionState(createSubject, initialState);

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <BookPlus size={20} className="text-primary" />
                    Tambah Mata Pelajaran
                </h2>
                <form action={formAction} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-slate-600">Nama Mata Pelajaran</label>
                        <input
                            name="name"
                            placeholder="Contoh: Matematika, Bahasa Indonesia"
                            className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            required
                        />
                    </div>

                    {state?.message && (
                        <p className={`text-sm p-3 rounded-lg ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {state.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary text-white p-3 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 font-semibold shadow-md active:scale-[0.98]"
                    >
                        {isPending ? 'Menyimpan...' : 'Tambah Mapel'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    Tips Mapel
                </h3>
                <ul className="text-xs text-slate-600 space-y-3">
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Mata pelajaran (Mapel) adalah modul inti pembelajaran.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Setelah dibuat, Mapel dapat dialokasikan ke kelas tertentu melalui menu **Alokasi Kursus**.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Pastikan penulisan nama Mapel sudah benar dan konsisten.
                    </li>
                </ul>
            </div>
        </div>
    );
}
