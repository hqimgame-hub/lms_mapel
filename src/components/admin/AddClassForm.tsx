'use client';

import { createClass } from "@/actions/classes";
import { useActionState } from "react";
import { Info, PlusCircle } from "lucide-react";

const initialState = {
    message: '',
    success: false,
    errors: undefined as Record<string, string[]> | undefined
};

export function AddClassForm() {
    const [state, formAction, isPending] = useActionState(createClass, initialState);

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <PlusCircle size={20} className="text-primary" />
                    Tambah Kelas Baru
                </h2>
                <form action={formAction} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Nama Kelas</label>
                            <input
                                name="name"
                                placeholder="Contoh: X-MIPA-1, XI-IPS-2"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Deskripsi</label>
                            <textarea
                                name="description"
                                placeholder="Keterangan tambahan (opsional)"
                                className="border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                rows={2}
                            />
                        </div>
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
                        {isPending ? 'Menyimpan...' : 'Tambah Kelas'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Info size={18} className="text-blue-500" />
                    Informasi Tambahan
                </h3>
                <ul className="text-xs text-slate-600 space-y-3">
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Nama kelas akan muncul di dashboard siswa dan guru.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Sistem akan membuatkan **Kode Kelas** unik secara otomatis setelah kelas berhasil dibuat.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        Kode kelas digunakan siswa untuk bergabung secara mandiri jika diperlukan.
                    </li>
                </ul>
            </div>
        </div>
    );
}
