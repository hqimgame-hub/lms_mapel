'use client';

import { useState } from 'react';
import {
    Database,
    Cloud,
    Download,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    FolderCheck,
    ArrowUpRight,
    ShieldCheck,
    FileCode,
    RefreshCw
} from 'lucide-react';

interface BackupClientProps {
    stats: Record<string, number>;
    totalRecords: number;
    hasGoogleDrive: boolean;
}

export function BackupClient({ stats, totalRecords, hasGoogleDrive }: BackupClientProps) {
    const [downloading, setDownloading] = useState(false);
    const [uploadingDrive, setUploadingDrive] = useState(false);
    const [driveResult, setDriveResult] = useState<{
        success: boolean;
        fileName?: string;
        viewUrl?: string;
        error?: string;
        generatedAt?: string;
    } | null>(null);

    // 1. Download file JSON directly to user's computer
    const handleDownloadJson = async () => {
        try {
            setDownloading(true);
            const response = await fetch('/api/admin/backup/download');
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Gagal mengunduh file backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const now = new Date().toISOString().slice(0, 10);
            a.download = `backup-lms-${now}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Download error:', error);
            alert('Gagal mengunduh backup: ' + (error.message || 'Terjadi kesalahan sistem'));
        } finally {
            setDownloading(false);
        }
    };

    // 2. Trigger backup directly to Google Drive
    const handleTriggerDriveBackup = async () => {
        try {
            setUploadingDrive(true);
            setDriveResult(null);

            const response = await fetch('/api/cron/backup', {
                method: 'POST',
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Gagal melakukan backup ke Google Drive');
            }

            setDriveResult({
                success: true,
                fileName: result.fileName,
                viewUrl: result.viewUrl,
                generatedAt: result.generatedAt,
            });
        } catch (error: any) {
            console.error('Drive backup error:', error);
            setDriveResult({
                success: false,
                error: error.message || 'Terjadi kesalahan saat memicu backup ke Google Drive',
            });
        } finally {
            setUploadingDrive(false);
        }
    };

    const tableDisplayNames: Record<string, string> = {
        User: 'Pengguna (Admin/Guru/Siswa)',
        Class: 'Rombongan Belajar (Kelas)',
        Subject: 'Mata Pelajaran',
        Course: 'Alokasi Kursus',
        Enrollment: 'Pendaftaran Siswa ke Kelas',
        Material: 'Materi Pembelajaran',
        MaterialContent: 'Isi Konten Materi',
        Exam: 'Ujian & Kuis',
        Assignment: 'Tugas Guru',
        Submission: 'Pengumpulan & Nilai Siswa',
        TutorialTopic: 'Topik Panduan Siswa',
        TutorialItem: 'Item Panduan Siswa'
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Top Cards: Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Google Drive Auto & Manual Backup */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-6 transition-colors">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Cloud size={24} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Terjadwal Harian
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                Backup Otomatis ke Google Drive
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Seluruh data database diekspor otomatis setiap hari pukul <strong>02:00 WIB</strong> ke folder <code>Backup_LMS</code> di Google Drive Anda.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col gap-2 border border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                                <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
                                <span>Jadwal: Setiap Hari pukul 02:00 WIB (Vercel Cron)</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                                <FolderCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Tujuan: Google Drive / Folder &quot;Backup_LMS&quot;</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                                <span>Format: File JSON Lengkap (Kompatibel dengan script restore)</span>
                            </div>
                        </div>

                        {driveResult && (
                            <div className={`p-4 rounded-2xl border ${driveResult.success
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                } flex flex-col gap-2 text-xs`}>
                                <div className="flex items-center gap-2 font-bold">
                                    {driveResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    <span>
                                        {driveResult.success
                                            ? 'Backup Berhasil Disimpan ke Google Drive!'
                                            : 'Gagal Menyimpan ke Google Drive'}
                                    </span>
                                </div>
                                {driveResult.success && (
                                    <div className="flex flex-col gap-1.5 pl-6">
                                        <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{driveResult.fileName}</p>
                                        {driveResult.viewUrl && (
                                            <a
                                                href={driveResult.viewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Buka File di Google Drive <ArrowUpRight size={14} />
                                            </a>
                                        )}
                                    </div>
                                )}
                                {driveResult.error && (
                                    <p className="pl-6 text-red-600 dark:text-red-400">{driveResult.error}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleTriggerDriveBackup}
                        disabled={uploadingDrive || !hasGoogleDrive}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60 cursor-pointer"
                    >
                        {uploadingDrive ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Sedang Mengekspor & Mengunggah ke Drive...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} />
                                <span>Backup Sekarang ke Google Drive</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Card 2: Manual Download JSON */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-6 transition-colors">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Download size={24} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                <FileCode size={14} />
                                Unduhan Instan
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                Unduh Cadangan ke Komputer
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Unduh snapshot seluruh data database langsung ke perangkat lokal Anda dalam format <code>.json</code>.
                            </p>
                        </div>

                        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-300 flex flex-col gap-2">
                            <p className="font-bold flex items-center gap-2">
                                <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                Kapan sebaiknya mengunduh file ini?
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 dark:text-slate-400 font-medium">
                                <li>Sebelum melakukan migrasi atau pergantian server database.</li>
                                <li>Sebelum menghapus pengguna/kelas/tugas dalam jumlah banyak.</li>
                                <li>Untuk arsip fisik di komputer/flashdisk admin sekolah.</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadJson}
                        disabled={downloading}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                    >
                        {downloading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Menyiapkan File Cadangan...</span>
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                <span>Unduh Backup (.JSON) Sekarang</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Card: Database Statistics */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Database size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-slate-800 dark:text-white tracking-tight">
                                Ringkasan Data Database Aktif
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Total data yang tercakup dalam setiap proses backup
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300">
                        Total {totalRecords.toLocaleString('id-ID')} Data Tersimpan
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(stats).map(([table, count]) => (
                        <div
                            key={table}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {tableDisplayNames[table] || table}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                    Tabel: {table}
                                </span>
                            </div>
                            <span className="text-sm font-black text-primary px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                {count.toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
