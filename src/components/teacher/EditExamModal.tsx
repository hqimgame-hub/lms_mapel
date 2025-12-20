'use client';

import { useState, useActionState, useEffect } from "react";
import { updateExam } from "@/actions/exams";
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

const initialState = { message: '', success: false, errors: undefined as Record<string, string[]> | undefined };

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Edit Ujian ✍️</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Perbarui detail tes/ujian</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form action={formAction} className="p-8 space-y-6">
                            <input type="hidden" name="id" value={exam.id} />
                            <input type="hidden" name="courseId" value={exam.courseId} />

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Type size={14} /> Judul Ujian
                                </label>
                                <input
                                    name="title"
                                    defaultValue={exam.title}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft size={14} /> Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={exam.description || ''}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-600 min-h-[80px] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={14} /> Link Google Form / Quiz
                                </label>
                                <input
                                    name="link"
                                    defaultValue={exam.link || ''}
                                    placeholder="https://docs.google.com/forms/..."
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-600 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} /> Waktu Mulai
                                    </label>
                                    <input
                                        name="startTime"
                                        type="datetime-local"
                                        defaultValue={exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : ''}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} /> Waktu Selesai
                                    </label>
                                    <input
                                        name="endTime"
                                        type="datetime-local"
                                        defaultValue={exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : ''}
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 opacity-50 pointer-events-none hidden">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} /> Batas Waktu (Legacy)
                                </label>
                                <input
                                    name="dueDate"
                                    type="datetime-local"
                                    defaultValue={exam.dueDate ? new Date(exam.dueDate).toISOString().slice(0, 16) : ''}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} /> Durasi (Menit)
                                </label>
                                <input
                                    name="duration"
                                    type="number"
                                    defaultValue={exam.duration || ''}
                                    placeholder="90"
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                />
                            </div>

                            {state?.message && !state.success && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
                                    {state.message}
                                    {state.errors && Object.keys(state.errors).map(key => {
                                        const errorList = state.errors?.[key];
                                        if (!errorList) return null;
                                        return (
                                            <p key={key} className="mt-1 flex items-center gap-1">• {key}: {Array.isArray(errorList) ? errorList.join(', ') : errorList}</p>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 bg-primary text-white p-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
