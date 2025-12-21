'use client';

import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { createMaterial } from "@/actions/materials";
import { useActionState } from "react";

interface ContentItem {
    type: string;
    content: string;
}

export function CreateMaterial({
    courseId,
    teacherCourses
}: {
    courseId?: string,
    teacherCourses?: { id: string, name: string }[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState<string[]>(courseId ? [courseId] : []);
    const [contentItems, setContentItems] = useState<ContentItem[]>([{ type: 'TEXT', content: '' }]);
    const [state, formAction, isPending] = useActionState(createMaterial, { message: '', success: false, errors: undefined as Record<string, string[]> | undefined });

    // Close on success and reset
    if (state.success && isOpen) {
        setIsOpen(false);
        setSelectedCourses(courseId ? [courseId] : []);
        setContentItems([{ type: 'TEXT', content: '' }]);
    }

    const toggleCourse = (id: string) => {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition shadow-md font-bold text-sm"
            >
                <Plus size={20} />
                Bagikan Materi
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 dark:bg-slate-800 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus size={18} />
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">Bagikan Materi</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
                    {/* Course Selection */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Kelas Tujuan</label>
                        {teacherCourses ? (
                            <div className="grid grid-cols-1 gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                {teacherCourses.map(course => (
                                    <label key={course.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="courseIds"
                                            value={course.id}
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => toggleCourse(course.id)}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-slate-800 dark:bg-slate-900"
                                        />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{course.name}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input type="hidden" name="courseIds" value={courseId} />
                        )}
                        {selectedCourses.length === 0 && (
                            <p className="text-amber-600 text-[9px] font-black uppercase ml-1">Pilih minimal satu kelas.</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Judul Materi</label>
                        <input name="title" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner" placeholder="E.g. Modul Bab 1" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deskripsi</label>
                        <textarea name="description" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-500 transition-all text-sm font-medium text-slate-600 dark:text-slate-400 min-h-[50px]" rows={2} placeholder="Penjelasan singkat..." />
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
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
                                >
                                    <option value="TEXT">📝 Teks Materi</option>
                                    <option value="PDF_LINK">📄 Link File PDF</option>
                                    <option value="YOUTUBE_LINK">🎬 Link Video YouTube</option>
                                    <option value="EXTERNAL_LINK">🔗 Link Eksternal</option>
                                </select>

                                <textarea
                                    value={item.content}
                                    onChange={(e) => updateContentItem(index, 'content', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-xs font-mono text-slate-600 dark:text-slate-400 min-h-[60px]"
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

                    {state?.message && (
                        <div className={`p-3 rounded-xl text-[11px] font-bold border transition-all ${state.success ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400'}`}>
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
                            disabled={isPending || selectedCourses.length === 0 || contentItems.some(item => !item.content)}
                            className="flex-1 px-4 py-3 bg-slate-900 dark:bg-slate-950 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-black disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20"
                        >
                            {isPending ? 'Membagikan...' : 'Bagikan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
