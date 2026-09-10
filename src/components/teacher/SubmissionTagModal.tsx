'use client';

import { useState, useTransition } from "react";
import { saveSubmissionTagAndNote } from "@/actions/grading";
import { Sparkles, AlertCircle, Lightbulb, MinusCircle, Tag, X } from "lucide-react";

const TAGS = [
    { value: 'HIGH_POTENTIAL', label: 'Potensi Tinggi', Icon: Sparkles },
    { value: 'NEED_ATTENTION', label: 'Perlu Perhatian', Icon: AlertCircle },
    { value: 'CREATIVE', label: 'Kreatif', Icon: Lightbulb },
    { value: 'PASSIVE', label: 'Pasif', Icon: MinusCircle },
] as const;

interface SubmissionTagModalProps {
    assignmentId: string;
    studentId: string;
    studentName: string;
    initialTag?: string | null;
    initialNote?: string | null;
}

export function SubmissionTagModal({ assignmentId, studentId, studentName, initialTag, initialNote }: SubmissionTagModalProps) {
    const [open, setOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(initialTag ?? null);
    const [noteText, setNoteText] = useState(initialNote ?? '');
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    const currentTagDef = TAGS.find(t => t.value === initialTag);

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSubmissionTagAndNote(
                assignmentId,
                studentId,
                selectedTag,
                noteText.trim() || null
            );
            setMessage(result.message);
            if (result.success) {
                setTimeout(() => {
                    setOpen(false);
                    setMessage(null);
                }, 1000);
            }
        });
    };

    return (
        <>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                    initialTag
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Tandai siswa & tambah catatan privat"
            >
                {currentTagDef ? (
                    (() => {
                        const TagIcon = currentTagDef.Icon;
                        return (
                            <>
                                <TagIcon size={10} />
                                <span>{currentTagDef.label}</span>
                            </>
                        );
                    })()
                ) : (
                    <>
                        <Tag size={10} />
                        <span>Tandai</span>
                    </>
                )}
            </button>

            {/* Modal overlay */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                        className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6 space-y-5"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-slate-100">Evaluasi Privat</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{studentName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tag selection */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tanda</p>
                            <div className="grid grid-cols-2 gap-2">
                                {TAGS.map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedTag(selectedTag === value ? null : value)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            selectedTag === value
                                                ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100'
                                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                        }`}
                                    >
                                        <Icon size={12} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catatan Privat</p>
                            <textarea
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Catatan untuk diri sendiri tentang siswa ini pada tugas ini..."
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs text-slate-600 dark:text-slate-300 resize-none"
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <p className={`text-xs font-bold ${isPending ? 'text-slate-400' : 'text-emerald-600'}`}>
                                {message}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="flex-1 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs hover:bg-slate-700 dark:hover:bg-white transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
