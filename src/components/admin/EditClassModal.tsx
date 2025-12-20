'use client';

import { updateClass } from "@/actions/classes";
import { useActionState, useState, useEffect } from "react";
import { School, Edit, X } from "lucide-react";

interface EditClassModalProps {
    classData: {
        id: string;
        name: string;
        description: string | null;
    };
}

export function EditClassModal({ classData }: EditClassModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateClass, { success: false, message: '', errors: undefined as Record<string, string[]> | undefined });

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
                title="Edit Kelas"
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
                        <School size={20} />
                        Edit Kelas
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={classData.id} />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Kelas</label>
                        <input
                            name="name"
                            defaultValue={classData.name}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi (Opsional)</label>
                        <textarea
                            name="description"
                            defaultValue={classData.description || ''}
                            className="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                        />
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
