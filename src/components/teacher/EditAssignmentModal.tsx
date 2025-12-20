'use client';

import { useState, useActionState, useEffect } from "react";
import { updateAssignment } from "@/actions/assignments";
import { Pencil, X, Calendar, Type, AlignLeft } from "lucide-react";

interface EditAssignmentModalProps {
    assignment: {
        id: string;
        title: string;
        description: string | null;
        dueDate: Date;
        courseId: string;
    }
}

const initialState = { message: '', success: false, errors: undefined };

export function EditAssignmentModal({ assignment }: EditAssignmentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateAssignment, initialState);

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
                title="Edit Tugas"
            >
                <Pencil size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Edit Tugas 📝</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Perbarui detail tugas siswa</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form action={formAction} className="p-8 space-y-6">
                            <input type="hidden" name="id" value={assignment.id} />
                            <input type="hidden" name="courseId" value={assignment.courseId} />

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Type size={14} /> Judul Tugas
                                </label>
                                <input
                                    name="title"
                                    defaultValue={assignment.title}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                    required
                                />
                                {(() => {
                                    const error = (state?.errors as any)?.title;
                                    return error ? <p className="text-red-500 text-xs font-bold">{error[0]}</p> : null;
                                })()}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft size={14} /> Deskripsi
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={assignment.description || ''}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-600 min-h-[120px] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} /> Tenggat Waktu
                                </label>
                                <input
                                    name="dueDate"
                                    type="datetime-local"
                                    defaultValue={new Date(assignment.dueDate).toISOString().slice(0, 16)}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-700 transition-all"
                                    required
                                />
                            </div>

                            {state?.message && !state.success && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
                                    {state.message}
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
