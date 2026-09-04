'use client';

import {
    createTutorialTopic,
    updateTutorialTopic,
    deleteTutorialTopic,
    toggleTutorialTopicStatus,
    createTutorialItem,
    updateTutorialItem,
    deleteTutorialItem,
    TutorialTopicData,
    TutorialItemData
} from '@/actions/tutorials';
import { ActionState } from '@/actions/types';
import { useActionState, useState, useEffect, useTransition } from 'react';
import {
    PlusCircle,
    Edit,
    Trash2,
    X,
    HelpCircle,
    Check,
    Video,
    FileText,
    Link as LinkIcon,
    Power,
    ExternalLink
} from 'lucide-react';

// ==========================================
// 1. ADD TUTORIAL TOPIC MODAL
// ==========================================
export function AddTutorialTopicModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createTutorialTopic, { success: false, message: '' } as ActionState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
                <PlusCircle size={16} />
                <span>Tambah Topik Panduan</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Tambah Topik Panduan</h3>
                            <p className="text-[11px] text-blue-100">Kategori atau judul panduan siswa</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Judul Topik Panduan <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            placeholder="Contoh: Cara Login & Reset Password Siswa"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Deskripsi Singkat (Opsional)
                        </label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="Panduan langkah demi langkah saat pertama kali masuk LMS..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium dark:text-slate-100 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Penempatan Tampil
                            </label>
                            <select
                                name="placement"
                                defaultValue="BOTH"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            >
                                <option value="BOTH">Keduanya (Login & Dashboard)</option>
                                <option value="LOGIN">Hanya Halaman Login</option>
                                <option value="DASHBOARD">Hanya Dashboard Siswa</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Urutan Tampil
                            </label>
                            <input
                                name="order"
                                type="number"
                                defaultValue={0}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Aktifkan topik ini langsung
                            </span>
                        </label>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold border ${state.success ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-md shadow-primary/20 disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan Topik'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 2. EDIT TUTORIAL TOPIC MODAL
// ==========================================
export function EditTutorialTopicModal({ topic }: { topic: { id: string; title: string; description: string | null; placement: string; isActive: boolean; order: number } }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateTutorialTopic, { success: false, message: '' } as ActionState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Topik"
            >
                <Edit size={16} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Edit size={18} />
                        </div>
                        <h3 className="font-bold text-sm">Edit Topik Panduan</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={topic.id} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Judul Topik Panduan
                        </label>
                        <input
                            name="title"
                            defaultValue={topic.title}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Deskripsi Singkat (Opsional)
                        </label>
                        <textarea
                            name="description"
                            rows={2}
                            defaultValue={topic.description || ''}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium dark:text-slate-100 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Penempatan Tampil
                            </label>
                            <select
                                name="placement"
                                defaultValue={topic.placement}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            >
                                <option value="BOTH">Keduanya (Login & Dashboard)</option>
                                <option value="LOGIN">Hanya Halaman Login</option>
                                <option value="DASHBOARD">Hanya Dashboard Siswa</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Urutan Tampil
                            </label>
                            <input
                                name="order"
                                type="number"
                                defaultValue={topic.order}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked={topic.isActive}
                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Aktifkan topik ini
                            </span>
                        </label>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold border ${state.success ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-md shadow-primary/20 disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 3. TOGGLE TOPIC STATUS BUTTON
// ==========================================
export function ToggleTutorialStatusButton({ id, isActive }: { id: string; isActive: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTutorialTopicStatus(id, isActive);
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                isActive
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            } disabled:opacity-50`}
            title={isActive ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
        >
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
        </button>
    );
}

// ==========================================
// 4. DELETE TOPIC BUTTON
// ==========================================
export function DeleteTutorialTopicButton({ id, title }: { id: string; title: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus topik "${title}" beserta seluruh link/videonya?`)) {
                    startTransition(async () => {
                        await deleteTutorialTopic(id);
                    });
                }
            }}
            disabled={isPending}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus Topik"
        >
            <Trash2 size={16} />
        </button>
    );
}

// ==========================================
// 5. ADD TUTORIAL ITEM MODAL
// ==========================================
export function AddTutorialItemModal({ topicId }: { topicId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(createTutorialItem, { success: false, message: '' } as ActionState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-md shadow-primary/20 transition-all active:scale-95"
            >
                <PlusCircle size={15} />
                <span>Tambah Link / Video</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <PlusCircle size={18} />
                        </div>
                        <h3 className="font-bold text-sm">Tambah Link Panduan Baru</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="topicId" value={topicId} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Judul Video / Artikel <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            placeholder="Contoh: Video Panduan Mengerjakan Ujian di Handphone"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            URL Link / Video YouTube <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="url"
                            type="url"
                            placeholder="https://youtu.be/xxx atau https://blog-sekolah.sch.id/xxx"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium dark:text-slate-100"
                            required
                        />
                        <p className="text-[11px] text-slate-400">
                            Paste tautan YouTube atau blog/artikel eksternal (diawali https://)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Tipe Konten
                            </label>
                            <select
                                name="type"
                                defaultValue="AUTO"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            >
                                <option value="AUTO">Otomatis Deteksi (YouTube/Blog)</option>
                                <option value="YOUTUBE">Video YouTube (Putar di Modal)</option>
                                <option value="BLOG">Artikel / Blog (Buka Tab Baru)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Urutan
                            </label>
                            <input
                                name="order"
                                type="number"
                                defaultValue={0}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold border ${state.success ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-md shadow-primary/20 disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Simpan Tautan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 6. EDIT TUTORIAL ITEM MODAL
// ==========================================
export function EditTutorialItemModal({ item }: { item: TutorialItemData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(updateTutorialItem, { success: false, message: '' } as ActionState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Tautan"
            >
                <Edit size={16} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Edit size={18} />
                        </div>
                        <h3 className="font-bold text-sm">Edit Tautan Panduan</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="topicId" value={item.topicId} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Judul Video / Artikel
                        </label>
                        <input
                            name="title"
                            defaultValue={item.title}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            URL Link
                        </label>
                        <input
                            name="url"
                            type="url"
                            defaultValue={item.url}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium dark:text-slate-100"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Tipe Konten
                            </label>
                            <select
                                name="type"
                                defaultValue={item.type}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            >
                                <option value="YOUTUBE">Video YouTube</option>
                                <option value="BLOG">Artikel / Blog</option>
                                <option value="LINK">Tautan Web</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Urutan
                            </label>
                            <input
                                name="order"
                                type="number"
                                defaultValue={item.order}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-semibold dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-xs font-bold border ${state.success ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-600 shadow-md shadow-primary/20 disabled:opacity-50"
                        >
                            {isPending ? 'Menyimpan...' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 7. DELETE TUTORIAL ITEM BUTTON
// ==========================================
export function DeleteTutorialItemButton({ id, topicId, title }: { id: string; topicId: string; title: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm(`Hapus tautan "${title}"?`)) {
                    startTransition(async () => {
                        await deleteTutorialItem(id, topicId);
                    });
                }
            }}
            disabled={isPending}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus Tautan"
        >
            <Trash2 size={16} />
        </button>
    );
}
