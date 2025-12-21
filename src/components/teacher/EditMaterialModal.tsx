'use client';

import { useState, useActionState, useEffect } from "react";
import { updateMaterial } from "@/actions/materials";
import { ActionState } from "@/actions/types";
import { Pencil, X, Plus, Trash2, FileText } from "lucide-react";

interface ContentItem {
    type: string;
    content: string;
}

interface EditMaterialModalProps {
    material: {
        id: string;
        title: string;
        description: string | null;
        courseId: string;
        contents: { type: string; content: string; order: number }[];
    }
}

const initialState: ActionState = { message: '', success: false, errors: undefined };

export function EditMaterialModal({ material }: EditMaterialModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [state, formAction, isPending] = useActionState(updateMaterial, initialState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    // Initialize content items when modal opens
    useEffect(() => {
        if (isOpen) {
            const sorted = [...material.contents].sort((a, b) => a.order - b.order);
            setContentItems(sorted.length > 0 ? sorted.map(c => ({ type: c.type, content: c.content })) : [{ type: 'TEXT', content: '' }]);
        }
    }, [isOpen, material.contents]);

    const addContentItem = () => {
        setContentItems([...contentItems, { type: 'TEXT', content: '' }]);
    };

    const removeContentItem = (index: number) => {
        if (contentItems.length > 1) {
            setContentItems(contentItems.filter((_, i) => i !== index));
        }
    };

    const updateContentItem = (index: number, field: 'type' | 'content', value: string) => {
        const updated = [...contentItems];
        updated[index][field] = value;
        setContentItems(updated);
    };

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
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
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

                            {/* Content Items */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Konten Materi</label>
                                    <button
                                        type="button"
                                        onClick={addContentItem}
                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <Plus size={14} />
                                        Tambah Konten
                                    </button>
                                </div>

                                {contentItems.map((item, index) => (
                                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase">Konten #{index + 1}</span>
                                            {contentItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeContentItem(index)}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <select
                                            value={item.type}
                                            onChange={(e) => updateContentItem(index, 'type', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
                                        >
                                            <option value="TEXT">📝 Teks Materi</option>
                                            <option value="PDF_LINK">📄 Link File PDF</option>
                                            <option value="YOUTUBE_LINK">🎬 Link Video YouTube</option>
                                            <option value="EXTERNAL_LINK">🔗 Link Eksternal</option>
                                        </select>

                                        <textarea
                                            value={item.content}
                                            onChange={(e) => updateContentItem(index, 'content', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-mono text-slate-600 dark:text-slate-400 min-h-[60px]"
                                            rows={2}
                                            placeholder={item.type === 'TEXT' ? 'Masukkan teks materi...' : 'Masukkan URL...'}
                                            required
                                        />

                                        {/* Hidden inputs for form submission */}
                                        <input type="hidden" name={`contentItems[${index}][type]`} value={item.type} />
                                        <input type="hidden" name={`contentItems[${index}][content]`} value={item.content} />
                                    </div>
                                ))}
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
                                    disabled={isPending || contentItems.some(item => !item.content)}
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
