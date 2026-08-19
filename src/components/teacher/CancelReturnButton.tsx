'use client';

import { cancelReturnSubmission } from "@/actions/submissions";
import { useActionState } from "react";
import { Undo2, Loader2 } from "lucide-react";

interface CancelReturnButtonProps {
    submissionId: string;
    assignmentId: string;
    text?: string;
}

export function CancelReturnButton({ submissionId, assignmentId, text }: CancelReturnButtonProps) {
    const [state, formAction, isPending] = useActionState(cancelReturnSubmission.bind(null, submissionId, assignmentId), { message: '', success: false });

    return (
        <form action={formAction} className="inline-block">
            <button
                type="submit"
                disabled={isPending}
                title="Batal Kembalikan Tugas (Kembalikan ke status Diserahkan)"
                className={`flex items-center gap-2 p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all disabled:opacity-50 ${text ? 'px-4 py-2 border border-blue-200 dark:border-blue-500/30 text-xs font-black uppercase tracking-widest' : ''}`}
                onClick={(e) => {
                    if (!confirm("Batalkan pengembalian tugas ini? Status akan kembali menjadi Diserahkan.")) {
                        e.preventDefault();
                    }
                }}
            >
                {isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                ) : (
                    <>
                        <Undo2 size={16} />
                        {text && <span>{text}</span>}
                    </>
                )}
            </button>
            {state?.message && !state.success && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                    {state.message}
                </div>
            )}
        </form>
    );
}
