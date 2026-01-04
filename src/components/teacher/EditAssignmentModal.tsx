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
        published: boolean;
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-600 dark:bg-blue-600/90 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Pencil size={18} />
                                </div>
                                <h3 className="font-bold text-sm tracking-tight">Edit Tugas</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form action={formAction} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                            <input type="hidden" name="id" value={assignment.id} />
                            <input type="hidden" name="courseId" value={assignment.courseId} />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Tugas</label>
                                <input
                                    name="title"
                                    defaultValue={assignment.title}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner"
                                    placeholder="Judul Tugas..."
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={assignment.description || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[100px]"
                                    rows={4}
                                    placeholder="Instruksi..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Link Lampiran (Opsional)</label>
                                <input
                                    name="attachmentUrl"
                                    defaultValue={assignment.attachmentUrl || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                                    placeholder="https://..."
                                />
                                <p className="text-[9px] text-slate-400 ml-1">Tautkan link Google Drive, YouTube, atau dokumen eksternal lainnya.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tenggat Waktu</label>
                                <input
                                    name="dueDate"
                                    type="datetime-local"
                                    defaultValue={new Date(assignment.dueDate).toISOString().slice(0, 16)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-[11px] font-bold text-slate-700 dark:text-slate-300"
                                    required
                                />
                            </div>

                            {state?.message && !state.success && (
                                <div className="p-3 rounded-xl text-[11px] font-bold border transition-all bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400">
                                    {state.message}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                                <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="published"
                                        value="on"
                                        defaultChecked={assignment.published}
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900"
                                    />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                                        Tampilkan ke Siswa?
                                    </span>
                                </label>
                            </div>

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
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
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
