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
        <form action={formAction} className="flex gap-2 items-start" onSubmit={() => setIsEditing(false)}>
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="assignmentId" value={assignmentId} />

            <div className="flex flex-col gap-1">
                <input
                    name="grade"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    className="border p-1 rounded w-20 text-center"
                    defaultValue={initialGrade || ''}
                    required
                />
            </div>

            <div className="flex flex-col gap-1 relative group">
                <input
                    name="feedback"
                    placeholder="Masukan/Feedback..."
                    className="border p-1 rounded w-48 text-sm"
                    defaultValue={initialFeedback || ''}
                    autoComplete="off"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm h-[30px]"
            >
                {isPending ? '...' : 'Simpan'}
            </button>

            {initialGrade !== undefined && (
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-600 px-1 py-1 h-[30px]"
                >
                    ✕
                </button>
            )}
        </form>
    );
}
