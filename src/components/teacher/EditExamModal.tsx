'use client';

import { useState, useActionState, useEffect } from "react";
import { updateExam } from "@/actions/exams";
import { ActionState } from "@/actions/types";
import { Pencil, X, Calendar, Type, AlignLeft, Globe, Clock } from "lucide-react";

interface EditExamModalProps {
    exam: {
        id: string;
        title: string;
        description: string | null;
        link: string | null;
        dueDate: Date | null;
        startTime: Date | null;
        endTime: Date | null;
        duration: number | null;
        courseId: string;
    }
}

const initialState: ActionState = { message: '', success: false, errors: undefined };

export function EditExamModal({ exam }: EditExamModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateExam, initialState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                title="Edit Ujian"
            >
                <Pencil size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Globe size={18} />
                                </div>
                                <h3 className="font-bold text-sm tracking-tight">Edit Ujian</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form action={formAction} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                            <input type="hidden" name="id" value={exam.id} />
                            <input type="hidden" name="courseId" value={exam.courseId} />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Ujian</label>
                                <input
                                    name="title"
                                    defaultValue={exam.title}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={exam.description || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[60px]"
                                    placeholder="Opsional"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Link Google Form / Quiz</label>
                                <input
                                    name="link"
                                    defaultValue={exam.link || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs font-medium text-slate-600 dark:text-slate-400"
                                    placeholder="https://docs.google.com/forms/..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Waktu Mulai</label>
                                    <input
                                        name="startTime"
                                        type="datetime-local"
                                        defaultValue={exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : ''}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Waktu Selesai</label>
                                    <input
                                        name="endTime"
                                        type="datetime-local"
                                        defaultValue={exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : ''}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Durasi (Menit)</label>
                                <input
                                    name="duration"
                                    type="number"
                                    defaultValue={exam.duration || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300"
                                />
                            </div>

                            {state?.message && !state.success && (
                                <div className="p-3 rounded-xl text-[11px] font-bold bg-red-50/50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-shake">
                                    {state.message}
                                </div>
                            )}

                            <div className="flex gap-3 pt-3">
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
            )}
        </>
    );
}
