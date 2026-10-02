'use client';

import { gradeSubmission } from "@/actions/grading";
import { returnSubmission } from "@/actions/submissions";
import { useActionState, useState, useEffect, useRef } from "react";
import { X, RotateCcw, Loader2 } from "lucide-react";

interface GradingPanelProps {
    submissionId: string;
    assignmentId: string;
    initialGrade?: number | null;
    initialFeedback?: string | null;
}

export function GradingPanel({ submissionId, assignmentId, initialGrade, initialFeedback }: GradingPanelProps) {
    const [gradeState, gradeFormAction, isGradePending] = useActionState(gradeSubmission, { message: '', success: false });
    const [returnState, returnFormAction, isReturnPending] = useActionState(
        returnSubmission.bind(null, submissionId, assignmentId),
        { message: '', success: false }
    );

    const isPending = isGradePending || isReturnPending;

    // Display state (shown when not editing)
    const [currentGrade, setCurrentGrade] = useState<number | null>(initialGrade ?? null);
    const [currentFeedback, setCurrentFeedback] = useState<string>(initialFeedback ?? '');
    const [isEditing, setIsEditing] = useState(initialGrade === null || initialGrade === undefined);

    // Shared input state — satu feedback dipakai untuk SIMPAN dan KEMBALIKAN
    const [gradeInput, setGradeInput] = useState<string>(
        initialGrade !== null && initialGrade !== undefined ? String(initialGrade) : ''
    );
    const [feedbackInput, setFeedbackInput] = useState<string>(initialFeedback ?? '');

    const submittedDataRef = useRef<{ grade: string; feedback: string } | null>(null);

    useEffect(() => {
        setCurrentGrade(initialGrade ?? null);
        setCurrentFeedback(initialFeedback ?? '');
    }, [initialGrade, initialFeedback]);

    // Handle grade save success - update local state immediately without blocking router transitions
    useEffect(() => {
        if (gradeState?.success && submittedDataRef.current !== null) {
            const { grade, feedback } = submittedDataRef.current;
            submittedDataRef.current = null;
            const numericGrade = grade.trim() === '' ? null : Number(grade);
            setCurrentGrade(numericGrade);
            setCurrentFeedback(feedback.trim());
            setIsEditing(false);
        }
    }, [gradeState]);

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

    const handleGradeSubmit = () => {
        submittedDataRef.current = { grade: gradeInput, feedback: feedbackInput };
    };

    // Tampilkan mode ringkas jika sudah dinilai dan tidak sedang edit
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
        <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">

                {/* Input Nilai */}
                <div className="relative flex-shrink-0">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Nilai"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value)}
                        disabled={isPending}
                        className="w-full md:w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-black text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-60"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">/100</div>
                </div>

                {/* Input Feedback — BERSAMA untuk Simpan & Kembalikan */}
                <div className="flex-1 w-full md:w-auto">
                    <input
                        placeholder="Catatan / pesan untuk siswa..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        disabled={isPending}
                        className="w-full md:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm disabled:opacity-60"
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-1 md:mt-0">

                    {/* Form SIMPAN NILAI — mengambil nilai feedbackInput via hidden input */}
                    <form action={gradeFormAction} onSubmit={handleGradeSubmit} className="flex items-center gap-2">
                        <input type="hidden" name="submissionId" value={submissionId} />
                        <input type="hidden" name="assignmentId" value={assignmentId} />
                        <input type="hidden" name="grade" value={gradeInput} />
                        <input type="hidden" name="feedback" value={feedbackInput} />
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 md:flex-none bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-1.5 min-w-[70px]"
                        >
                            {isGradePending ? (
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
                    </form>

                    {/* Form KEMBALIKAN — mengambil feedbackInput yang SAMA via hidden input */}
                    <form action={returnFormAction} className="flex items-center">
                        <input type="hidden" name="feedback" value={feedbackInput} />
                        <button
                            type="submit"
                            disabled={isPending}
                            title="Kembalikan ke Siswa"
                            className="flex items-center gap-2 p-2.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isReturnPending ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <RotateCcw size={16} />
                            )}
                        </button>
                    </form>

                </div>
            </div>

            {gradeState.message && !gradeState.success && (
                <p className="text-xs text-red-500 font-bold">{gradeState.message}</p>
            )}
            {returnState?.message && !returnState.success && (
                <div className="fixed bottom-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-lg text-xs font-bold">
                    {returnState.message}
                </div>
            )}
        </div>
    );
}
