'use client';

import { gradeSubmission } from "@/actions/grading";
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface GradeFormProps {
    submissionId: string;
    initialGrade?: number | null;
    initialFeedback?: string | null;
    assignmentId: string;
}

export function GradeForm({ submissionId, initialGrade, initialFeedback, assignmentId }: GradeFormProps) {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(gradeSubmission, { message: '', success: false });

    // Local state for displayed values
    const [currentGrade, setCurrentGrade] = useState<number | null>(initialGrade ?? null);
    const [currentFeedback, setCurrentFeedback] = useState<string>(initialFeedback ?? '');
    const [isEditing, setIsEditing] = useState(initialGrade === null || initialGrade === undefined);

    // Form inputs state
    const [gradeInput, setGradeInput] = useState<string>(
        initialGrade !== null && initialGrade !== undefined ? String(initialGrade) : ''
    );
    const [feedbackInput, setFeedbackInput] = useState<string>(initialFeedback ?? '');

    // Synchronize local state when props change from server
    useEffect(() => {
        setCurrentGrade(initialGrade ?? null);
        setCurrentFeedback(initialFeedback ?? '');
        if (!isEditing) {
            setGradeInput(initialGrade !== null && initialGrade !== undefined ? String(initialGrade) : '');
            setFeedbackInput(initialFeedback ?? '');
        }
    }, [initialGrade, initialFeedback, isEditing]);

    // Handle successful save: close edit mode, update displayed values, and refresh server data
    useEffect(() => {
        if (state?.success) {
            const numericGrade = gradeInput.trim() === '' ? null : Number(gradeInput);
            setCurrentGrade(numericGrade);
            setCurrentFeedback(feedbackInput.trim());
            setIsEditing(false);
            router.refresh();
        }
    }, [state, router, gradeInput, feedbackInput]);

    const handleStartEditing = () => {
        setGradeInput(currentGrade !== null && currentGrade !== undefined ? String(currentGrade) : '');
        setFeedbackInput(currentFeedback || '');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setGradeInput(currentGrade !== null && currentGrade !== undefined ? String(currentGrade) : '');
        setFeedbackInput(currentFeedback || '');
        setIsEditing(false);
    };

    if (!isEditing && currentGrade !== null && currentGrade !== undefined) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">{currentGrade}/100</div>
                    {currentFeedback ? (
                        <div className="text-xs text-gray-500 max-w-xs truncate" title={currentFeedback}>
                            {currentFeedback}
                        </div>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={handleStartEditing}
                    className="text-sm text-gray-500 hover:text-blue-600 underline font-medium"
                >
                    Ubah
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-2 w-full">
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="assignmentId" value={assignmentId} />

            {/* Grade + Feedback row */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <div className="relative">
                        <input
                            name="grade"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Nilai"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            disabled={isPending}
                            className="w-full md:w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-black text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-60"
                            required
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">/100</div>
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto">
                    <input
                        name="feedback"
                        placeholder="Catatan untuk siswa..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        disabled={isPending}
                        className="w-full md:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm disabled:opacity-60"
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-1 md:mt-0">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 md:flex-none bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-1.5 min-w-[70px]"
                    >
                        {isPending ? (
                            <>
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                <span>...</span>
                            </>
                        ) : 'Simpan'}
                    </button>

                    {currentGrade !== undefined && currentGrade !== null && (
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleCancel}
                            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                            title="Batal"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {state.message && !state.success && (
                <p className="text-xs text-red-500 font-bold">{state.message}</p>
            )}
        </form>
    );
}
