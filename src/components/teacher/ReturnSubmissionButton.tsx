'use client';

import { returnSubmission } from "@/actions/submissions";
import { useActionState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";

interface ReturnSubmissionButtonProps {
    submissionId: string;
    assignmentId: string;
    text?: string;
}

export function ReturnSubmissionButton({ submissionId, assignmentId, text }: ReturnSubmissionButtonProps) {
    const [state, formAction, isPending] = useActionState(returnSubmission.bind(null, submissionId, assignmentId), { message: '', success: false });

    return (
        <form action={formAction} className="inline-block">
            <button
                type="submit"
                disabled={isPending}
                title="Kembalikan ke Siswa (Jadikan Draft)"
                className={`flex items-center gap-2 p-2.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all disabled:opacity-50 ${text ? 'px-4 py-2 border border-orange-200 dark:border-orange-500/30 text-xs font-black uppercase tracking-widest' : ''}`}
                onClick={(e) => {
                    if (!confirm("Kembalikan tugas ini ke siswa? Status akan menjadi Draft dan nilai akan dihapus.")) {
                        e.preventDefault();
                    }
                }}
            >
                {isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                ) : (
                    <>
                        <RotateCcw size={16} />
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
