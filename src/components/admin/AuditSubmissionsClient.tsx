'use client';

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { 
    AlertTriangle, 
    ArrowRight, 
    CheckCircle2, 
    FileText, 
    Trash2, 
    RefreshCw, 
    ExternalLink, 
    User, 
    ShieldAlert, 
    Sparkles,
    EyeOff
} from "lucide-react";
import { 
    migrateSubmission, 
    deleteMismatchedSubmission, 
    dismissMismatchedSubmission,
    batchCleanOrMigrateAll
} from "@/actions/audit-submissions";

interface MismatchedItem {
    id: string;
    status: string;
    submittedAt: string | null;
    fileName: string | null;
    fileUrl: string | null;
    content: string | null;
    grade: number | null;
    feedback: string | null;
    student: {
        id: string;
        name: string;
        username: string;
        currentClass: string;
        currentClassId: string;
    };
    assignment: {
        id: string;
        title: string;
        sourceClass: string;
        sourceClassId: string;
        subjectName: string;
        teacherName: string;
    };
    targetAssignment: {
        id: string;
        title: string;
        className: string;
        hasExistingSubmission: boolean;
        existingSubmissionStatus: string | null;
    } | null;
}

export function AuditSubmissionsClient({ 
    initialData 
}: { 
    initialData: MismatchedItem[] 
}) {
    const [items, setItems] = useState<MismatchedItem>(initialData as any);
    const [itemsList, setItemsList] = useState<MismatchedItem[]>(initialData);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const pendingQueueCount = itemsList.filter(i => i.status === 'SUBMITTED').length;
    const uniqueStudentsCount = new Set(itemsList.map(i => i.student.id)).size;

    const handleMigrate = (id: string) => {
        startTransition(async () => {
            const res = await migrateSubmission(id);
            if (res.success) {
                setItemsList(prev => prev.filter(i => i.id !== id));
                setMessage({ type: 'success', text: res.message });
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Yakin ingin menghapus submisi ini? Tindakan ini tidak dapat dibatalkan.')) return;
        startTransition(async () => {
            const res = await deleteMismatchedSubmission(id);
            if (res.success) {
                setItemsList(prev => prev.filter(i => i.id !== id));
                setMessage({ type: 'success', text: res.message });
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        });
    };

    const handleDismiss = (id: string) => {
        startTransition(async () => {
            const res = await dismissMismatchedSubmission(id);
            if (res.success) {
                setItemsList(prev => prev.map(i => i.id === id ? { ...i, status: 'DRAFT', submittedAt: null } : i));
                setMessage({ type: 'success', text: res.message });
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        });
    };

    const handleBatchFix = () => {
        if (!confirm('Sistem akan otomatis memindahkan submisi yang cocok ke kelas aktif siswa dan membersihkan draf usang. Lanjutkan?')) return;
        startTransition(async () => {
            const res = await batchCleanOrMigrateAll();
            if (res.success) {
                setMessage({ type: 'success', text: res.message });
                // Refresh full page or filter
                window.location.reload();
            } else {
                setMessage({ type: 'error', text: res.message });
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold animate-in fade-in ${
                    message.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20' 
                        : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/20'
                }`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">✕ Tutup</button>
                </div>
            )}

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                            <ShieldAlert size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Submisi Nyasar</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white">
                        {itemsList.length}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submisi yang kelas tugasnya tidak sesuai kelas aktif siswa</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Gantung di Antrean Guru</span>
                    </div>
                    <div className="text-3xl font-black text-red-600 dark:text-red-400">
                        {pendingQueueCount}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status SUBMITTED (muncul di antrean penilaian guru)</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                            <User size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">Siswa Terdampak</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800 dark:text-white">
                        {uniqueStudentsCount}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jumlah akun siswa yang memiliki riwayat lintas kelas</p>
                </div>
            </div>

            {/* Quick Batch Actions */}
            {itemsList.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-[2rem]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary text-white rounded-xl shadow-md shadow-primary/20">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">Otomasi Perbaikan Bersih</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Pindahkan tugas yang cocok dan bersihkan draf/tugas kembali usang dengan sekali klik.</div>
                        </div>
                    </div>
                    <button
                        onClick={handleBatchFix}
                        disabled={isPending}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                        <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
                        Perbaiki Semua Otomatis
                    </button>
                </div>
            )}

            {/* Submissions List */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white">Daftar Submisi Lintas Kelas</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Submisi yang tersimpan pada kelas selain kelas aktif siswa saat ini.</p>
                    </div>
                </div>

                {itemsList.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                        <div className="p-5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full">
                            <CheckCircle2 size={48} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Semua Submisi Bersih!</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                Tidak ada submisi siswa yang nyasar antar kelas. Semua pengumpulan tugas cocok dengan kelas aktif masing-masing siswa.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {itemsList.map(item => {
                            const isSubmitted = item.status === 'SUBMITTED';
                            return (
                                <div key={item.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    {/* Left: Student & Assignment Info */}
                                    <div className="space-y-3 max-w-2xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-black text-slate-800 dark:text-slate-200 text-base">{item.student.name}</span>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">(@{item.student.username})</span>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-md">
                                                Kelas Aktif: {item.student.currentClass}
                                            </span>
                                            {isSubmitted && (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-md flex items-center gap-1 animate-pulse">
                                                    <AlertTriangle size={10} /> Nyangkut di Antrean Guru
                                                </span>
                                            )}
                                            {!isSubmitted && (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                                    Status: {item.status}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">Tugas Asal:</span>
                                                <span className="font-extrabold text-slate-900 dark:text-white">{item.assignment.title}</span>
                                                <span className="text-slate-400">({item.assignment.subjectName} • {item.assignment.teacherName})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <span>Kelas Tempat Tugas Disimpan:</span>
                                                <span className="font-bold text-amber-600 dark:text-amber-400 underline">{item.assignment.sourceClass}</span>
                                                <span>(Bukan kelas siswa saat ini!)</span>
                                            </div>
                                            {item.fileUrl && (
                                                <div className="pt-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                    <FileText size={14} />
                                                    <a 
                                                        href={item.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="font-bold hover:underline flex items-center gap-1 truncate max-w-sm"
                                                    >
                                                        {item.fileName || 'Lihat Berkas Lampiran'}
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Target matching info */}
                                        {item.targetAssignment ? (
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                                                <CheckCircle2 size={14} />
                                                <span>
                                                    Ditemukan tugas tujuan serupa di kelas {item.targetAssignment.className}
                                                    {item.targetAssignment.hasExistingSubmission ? ` (Siswa sudah punya baris di kelas baru: ${item.targetAssignment.existingSubmissionStatus})` : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-400 dark:text-slate-500 italic">
                                                Tidak ditemukan tugas dengan judul persis sama di kelas {item.student.currentClass}.
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Action Buttons */}
                                    <div className="flex flex-wrap lg:flex-col items-stretch gap-2 w-full lg:w-auto min-w-[200px]">
                                        {item.targetAssignment && (
                                            <button
                                                onClick={() => handleMigrate(item.id)}
                                                disabled={isPending}
                                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <ArrowRight size={14} />
                                                Pindahkan ke {item.targetAssignment.className}
                                            </button>
                                        )}

                                        {isSubmitted && (
                                            <button
                                                onClick={() => handleDismiss(item.id)}
                                                disabled={isPending}
                                                className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-xs border border-amber-200 dark:border-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                title="Ubah status ke DRAFT agar hilang dari antrean guru tanpa menghapus berkas"
                                            >
                                                <EyeOff size={14} />
                                                Lepas dari Antrean (DRAFT)
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={isPending}
                                            className="px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs border border-red-200 dark:border-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                            Hapus Submisi
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
