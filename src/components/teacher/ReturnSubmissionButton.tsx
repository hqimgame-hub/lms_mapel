'use client';

import { returnSubmission } from "@/actions/submissions";
import { useActionState, useState } from "react";
import { RotateCcw, Loader2, X, Send } from "lucide-react";

interface ReturnSubmissionButtonProps {
    submissionId: string;
    assignmentId: string;
    text?: string;
}

export function ReturnSubmissionButton({ submissionId, assignmentId, text }: ReturnSubmissionButtonProps) {
    const [state, formAction, isPending] = useActionState(
        returnSubmission.bind(null, submissionId, assignmentId),
        { message: '', success: false }
    );
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                type="button"
                title="Kembalikan ke Siswa"
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 p-2.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all ${text ? 'px-4 py-2 border border-orange-200 dark:border-orange-500/30 text-xs font-black uppercase tracking-widest' : ''}`}
            >
                <RotateCcw size={16} />
                {text && <span>{text}</span>}
            </button>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-2 w-full">
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">
                        Pesan untuk Siswa (Opsional)
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X size={14} />
                    </button>
                </div>
                <textarea
                    name="feedback"
                    placeholder="Tulis alasan pengembalian atau arahan perbaikan..."
                    rows={2}
                    disabled={isPending}
                    className="w-full bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-500/30 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 resize-none disabled:opacity-60 placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                    {isPending ? (
                        <><Loader2 className="animate-spin" size={13} /><span>Memproses...</span></>
                    ) : (
                        <><Send size={13} /><span>Kembalikan Tugas</span></>
                    )}
                </button>
            </div>
            {state?.message && !state.success && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                    {state.message}
                </div>
            )}
        </form>
    );
}
