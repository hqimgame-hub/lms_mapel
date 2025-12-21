'use client';

import { useState, useActionState, useEffect } from "react";
import { updateMaterial } from "@/actions/materials";
import { ActionState } from "@/actions/types";
import { Pencil, X, Type, AlignLeft, Link as LinkIcon, FileText } from "lucide-react";

interface EditMaterialModalProps {
    material: {
        id: string;
        title: string;
        description: string | null;
        type: string;
        content: string;
        courseId: string;
    }
}

const initialState: ActionState = { message: '', success: false, errors: undefined };

export function EditMaterialModal({ material }: EditMaterialModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateMaterial, initialState);

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
                title="Edit Materi"
            >
                <Pencil size={18} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                                    <FileText size={18} />
                                </div>
                                <h3 className="font-bold text-sm tracking-tight">Edit Materi</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form action={formAction} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                            <input type="hidden" name="id" value={material.id} />
                            <input type="hidden" name="courseId" value={material.courseId} />

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Materi</label>
                                <input
                                    name="title"
                                    defaultValue={material.title}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner"
                                    placeholder="Masukkan judul materi"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={material.description || ''}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[60px]"
                                    placeholder="Opsional"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipe Materi</label>
                                <select
                                    name="type"
                                    defaultValue={material.type}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                                    required
                                >
                                    <option value="TEXT" className="dark:bg-slate-900">📝 Teks Materi</option>
                                    <option value="YOUTUBE_LINK" className="dark:bg-slate-900">🎥 Video YouTube</option>
                                    <option value="PDF_LINK" className="dark:bg-slate-900">📄 Link PDF/Dokumen</option>
                                    <option value="EXTERNAL_LINK" className="dark:bg-slate-900">🌐 Link Eksternal</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Konten / Link</label>
                                <textarea
                                    name="content"
                                    defaultValue={material.content}
                                    placeholder="Isi teks materi atau tempel link..."
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-xs font-mono text-slate-600 dark:text-slate-400 min-h-[100px]"
                                    required
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
