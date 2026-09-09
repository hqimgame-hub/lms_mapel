'use client';

import { gradeSubmission } from "@/actions/grading";
import { useActionState, useState } from "react";
import { Sparkles, AlertCircle, Lightbulb, MinusCircle, Tag } from "lucide-react";

const TAGS = [
    { value: 'HIGH_POTENTIAL', label: 'Potensi Tinggi', Icon: Sparkles },
    { value: 'NEED_ATTENTION', label: 'Perlu Perhatian', Icon: AlertCircle },
    { value: 'CREATIVE', label: 'Kreatif', Icon: Lightbulb },
    { value: 'PASSIVE', label: 'Pasif', Icon: MinusCircle },
] as const;

interface GradeFormProps {
    submissionId: string;
    initialGrade?: number | null;
    initialFeedback?: string | null;
    initialTag?: string | null;
    initialNote?: string | null;
    assignmentId: string;
}

export function GradeForm({ submissionId, initialGrade, initialFeedback, initialTag, initialNote, assignmentId }: GradeFormProps) {
    const [state, formAction, isPending] = useActionState(gradeSubmission, { message: '', success: false });
    const [isEditing, setIsEditing] = useState(!initialGrade);
    const [selectedTag, setSelectedTag] = useState<string | null>(initialTag ?? null);
    const [noteText, setNoteText] = useState(initialNote ?? '');

    const currentTagDef = TAGS.find(t => t.value === (initialTag ?? selectedTag));

    if (!isEditing && initialGrade !== null) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">{initialGrade}/100</div>
                        {initialFeedback && <div className="text-xs text-gray-500 max-w-xs truncate">{initialFeedback}</div>}
                    </div>
                    <button onClick={() => setIsEditing(true)} className="text-sm text-gray-500 hover:text-blue-600 underline">
                        Ubah
                    </button>
                </div>
                {currentTagDef && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        <currentTagDef.Icon size={11} />
                        {currentTagDef.label}
                    </div>
                )}
            </div>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-3 w-full" onSubmit={() => setIsEditing(false)}>
            <input type="hidden" name="submissionId" value={submissionId} />
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <input type="hidden" name="teacherTag" value={selectedTag ?? 'NONE'} />
            <input type="hidden" name="teacherNote" value={noteText} />

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
            </div>

            {/* Tag + Catatan Guru (privat) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={10} /> Evaluasi Privat Guru
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {TAGS.map(({ value, label, Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedTag(selectedTag === value ? null : value)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                selectedTag === value
                                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                        >
                            <Icon size={11} />
                            {label}
                        </button>
                    ))}
                </div>
                <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Catatan privat untuk diri sendiri tentang siswa ini pada tugas ini..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs text-slate-600 dark:text-slate-400 resize-none"
                />
                {state.message && !state.success && (
                    <p className="text-xs text-red-500 font-bold">{state.message}</p>
                )}
            </div>
        </form>
    );
}
