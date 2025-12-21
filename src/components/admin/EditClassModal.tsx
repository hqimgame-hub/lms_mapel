'use client';

import { updateClass } from "@/actions/classes";
import { ActionState } from "@/actions/types";
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
    const [state, formAction, isPending] = useActionState(updateClass, { success: false, message: '', errors: undefined } as ActionState);

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <School size={18} />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">Edit Kelas</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-5 space-y-3.5">
                    <input type="hidden" name="id" value={classData.id} />

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Kelas</label>
                        <input
                            name="name"
                            defaultValue={classData.name}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium dark:text-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi <span className="opacity-50">(Opsional)</span></label>
                        <textarea
                            name="description"
                            defaultValue={classData.description || ''}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium dark:text-slate-200 min-h-[100px]"
                        />
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border transition-all ${state.success ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
                            {state.message}
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
