'use client';

import { gradeSubmission } from "@/actions/grading";
import { useActionState, useState } from "react";

interface GradeFormProps {
    submissionId: string;
    initialGrade?: number | null;
    initialFeedback?: string | null;
    assignmentId: string;
}

export function GradeForm({ submissionId, initialGrade, initialFeedback, assignmentId }: GradeFormProps) {
    const [state, formAction, isPending] = useActionState(gradeSubmission, { message: '', success: false });
    const [isEditing, setIsEditing] = useState(!initialGrade);

    if (!isEditing && initialGrade !== null) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">{initialGrade}/100</div>
                    {initialFeedback && <div className="text-xs text-gray-500 max-w-xs truncate">{initialFeedback}</div>}
                </div>
                <button onClick={() => setIsEditing(true)} className="text-sm text-gray-500 hover:text-blue-600 underline">
                    Ubah
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="flex flex-col md:flex-row gap-3 items-start md:items-center" onSubmit={() => setIsEditing(false)}>
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="assignmentId" value={assignmentId} />

            <div className="flex flex-col gap-1 w-full md:w-auto">
                <div className="relative">
                    <input
                        name="grade"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Nilai"
                        className="w-full md:w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-black text-slate-700 dark:text-slate-300 shadow-sm"
                        defaultValue={initialGrade || ''}
                        required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">/100</div>
                </div>
            </div>

            <div className="flex-1 w-full md:w-auto">
                <input
                    name="feedback"
                    placeholder="Beri feedback singkat..."
                    className="w-full md:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm"
                    defaultValue={initialFeedback || ''}
                    autoComplete="off"
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-1 md:mt-0">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 md:flex-none bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isPending ? '...' : 'Simpan'}
                </button>

                {initialGrade !== undefined && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>
        </form>
    );
}
