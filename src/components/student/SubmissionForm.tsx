'use client';

import { saveSubmission, getDraftFile } from "@/actions/submissions";
import { useState, useActionState, useEffect } from "react";
import { Save, Send, Clock, CheckCircle, Smartphone, Download, Copy, Monitor, QrCode, Mail, Loader2, Share2, Upload, FileText } from "lucide-react";

interface SubmissionFormProps {
    assignmentId: string;
    initialContent?: string | null;
    initialFileUrl?: string | null;
    initialFileName?: string | null;
    initialTempFileName?: string | null;
    status?: string; // DRAFT or SUBMITTED etc
    dueDate: Date;
}

export function SubmissionForm({ assignmentId, initialContent, initialFileUrl, initialFileName, initialTempFileName, status, dueDate }: SubmissionFormProps) {
    const [state, formAction, isPending] = useActionState(saveSubmission, { message: '', success: false });
    const [showShare, setShowShare] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    // File states
    const [fileUrl, setFileUrl] = useState(initialFileUrl || '');
    const [fileName, setFileName] = useState(initialFileName || '');
    const [tempFileName, setTempFileName] = useState(initialTempFileName || '');

    const [currentContent, setCurrentContent] = useState(initialContent || '');

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

    useEffect(() => {
        if (state.success && state.message?.includes("Backup File berhasil disimpan")) {
            // Optional: Show specific toast/alert if needed
        }
    }, [state]);

    // Sync state with server data (important after revalidatePath)
    useEffect(() => {
        if (initialTempFileName) setTempFileName(initialTempFileName);
        if (initialFileUrl) setFileUrl(initialFileUrl);
        if (initialFileName) setFileName(initialFileName);
        if (initialContent) setCurrentContent(initialContent);
    }, [initialTempFileName, initialFileUrl, initialFileName, initialContent]);

    const downloadTxt = () => {
        const element = document.createElement("a");
        const file = new Blob([currentContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `tugas-${assignmentId}.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const downloadDraftFile = async () => {
        try {
            setDownloading(true);
            const result = await getDraftFile(assignmentId);
            if (result.error || !result.file) {
                alert("Gagal mengunduh file backup: " + (result.error || "File tidak ditemukan"));
                return;
            }

            const link = document.createElement("a");
            link.href = result.file; // Base64 url
            link.download = result.name || `backup-${assignmentId}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan saat mengunduh file.");
        } finally {
            setDownloading(false);
        }
    };

    const isLocked = status === 'SUBMITTED' || status === 'GRADED';

    return (
        <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-800 tracking-tight flex items-center gap-3">
                    Jawaban Anda
                    {status === 'DRAFT' && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">Draft Disimpan</span>
                    )}
                    {isLocked && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">Diserahkan</span>
                    )}
                </h3>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                <input type="hidden" name="assignmentId" value={assignmentId} />
                <input type="hidden" name="fileUrl" value={fileUrl} />
                <input type="hidden" name="fileName" value={fileName} />

                {/* Internal Draft Upload Section */}
                {!isLocked && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-3xl border border-amber-100 dark:border-amber-800 shadow-sm border-dashed">
                        <div className="flex justify-between items-start mb-3">
                            <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                                <Upload size={14} className="inline mr-1 mb-0.5" />
                                Backup File (Lab Mode)
                            </label>
                            {tempFileName && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-700">
                                    Tersimpan: {tempFileName}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium leading-relaxed">
                                Mode Lab: Upload file kerjamu di sini agar bisa didownload lagi di rumah. (Gunakan ini jika tidak bisa login Google Drive di Lab).
                            </p>

                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    name="backupFile"
                                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-xl file:border-0
                                    file:text-xs file:font-black file:uppercase file:tracking-widest
                                    file:bg-amber-600 file:text-white
                                    file:cursor-pointer hover:file:bg-amber-700
                                    transition-all"
                                />
                            </div>

                            {tempFileName && (
                                <button
                                    type="button"
                                    onClick={downloadDraftFile}
                                    disabled={downloading}
                                    className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-200 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-slate-600 transition-all w-full md:w-auto self-start shadow-sm"
                                >
                                    {downloading ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                    Download "{tempFileName}"
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="relative group">
                    <textarea
                        name="content"
                        className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 min-h-[300px] text-slate-700 placeholder:text-slate-400 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium leading-relaxed shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="Ketik jawaban Anda di sini. Jawaban Anda akan otomatis tersimpan sebagai draf..."
                        value={currentContent}
                        onChange={(e) => setCurrentContent(e.target.value)}
                        disabled={isLocked}
                    />
                    {!isLocked && (
                        <div className="absolute right-4 bottom-4 flex items-center gap-2 text-slate-400 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Draf Tersinkron</span>
                        </div>
                    )}
                </div>

                {/* Link Submission Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Link Tugas (Google Drive / Docs / Canva / YouTube)</label>

                    <div className="space-y-3">
                        <div className="relative">
                            <input
                                type="url"
                                value={fileUrl}
                                onChange={(e) => {
                                    setFileUrl(e.target.value);
                                    // Auto-set filename based on url if empty
                                    if (!fileName && e.target.value) {
                                        setFileName("Link Tugas");
                                    }
                                }}
                                disabled={isLocked}
                                placeholder="Tempel link tugasmu di sini (https://...)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 font-medium text-slate-700 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Share2 size={20} />
                            </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Monitor size={16} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Tips: Upload tugasmu ke Google Drive/OneDrive, lalu copy linknya (pastikan akses "Anyone with the link" aktif) dan paste di atas.
                            </p>
                        </div>

                        {fileUrl && (
                            <div className="mt-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                <CheckCircle size={16} />
                                Link siap diserahkan!
                            </div>
                        )}
                    </div>
                </div>

                {state?.message && (
                    <div className={`p-4 rounded-2xl text-sm font-bold animate-in fade-in zoom-in duration-200 ${state.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {state.message}
                    </div>
                )}

                {!isLocked && (
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                type="submit"
                                name="action"
                                value="DRAFT"
                                disabled={isPending}
                                className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-white text-slate-600 px-8 py-4 rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 font-black text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Save size={20} />
                                Simpan ke Cloud
                            </button>
                            <button
                                type="submit"
                                name="action"
                                value="SUBMIT"
                                disabled={isPending}
                                className="w-full sm:flex-1 flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-black text-sm transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                                onClick={(e) => {
                                    if (!confirm("Sudah yakin dengan jawabanmu? Setelah diserahkan, tugas tidak bisa diubah lagi.")) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <Send size={20} />
                                Serahkan Tugas
                            </button>
                        </div>

                        {/* Lab Support Tools */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowEmailModal(true)}
                                className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                            >
                                <Mail size={16} />
                                Kirim ke Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowShare(true)}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all md:hidden"
                            >
                                <Smartphone size={16} />
                                Lanjutkan di HP
                            </button>
                            <button
                                type="button"
                                onClick={downloadTxt}
                                className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                <Download size={16} />
                                Simpan Lab (.txt)
                            </button>
                        </div>
                    </div>
                )}

                {/* Email Backup Modal */}
                {showEmailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                        <Mail size={24} />
                                    </div>
                                    <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600 italic text-xs font-bold">Tutup</button>
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Kirim Cadangan ke Email 📧</h4>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Salinan jawaban akan dikirimkan ke emailmu untuk berjaga-jaga.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Email Penerima</label>
                                    <input
                                        type="email"
                                        placeholder="contoh: nama@email.com"
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-slate-700 transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSendingEmail(true);
                                        setTimeout(() => {
                                            setSendingEmail(false);
                                            setShowEmailModal(false);
                                            alert("Fitur simulasi: Draf berhasil dikirim ke email!");
                                        }, 1500);
                                    }}
                                    disabled={sendingEmail}
                                    className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {sendingEmail ? <Loader2 className="animate-spin" size={20} /> : "Kirim Sekarang"}
                                </button>
                                <p className="text-[10px] text-center text-slate-400 font-bold italic">* Tetap disarankan untuk mengklik 'Simpan ke Cloud' di layar tugas.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile / QR Modal */}
                {showShare && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <QrCode size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Pindah ke HP 📱</h4>
                                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Klik "Simpan ke Cloud" di PC ini dulu, lalu scan untuk lanjut di rumah.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 inline-block mx-auto mb-2">
                                    <img src={qrUrl} alt="Scan to continue" className="w-48 h-48 rounded-lg" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 p-2 rounded-lg">Scan menggunakan Kamera HP / Google Lens</p>
                                <button
                                    type="button"
                                    onClick={() => setShowShare(false)}
                                    className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isLocked && (
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center flex flex-col items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={32} />
                        <div>
                            <p className="text-emerald-700 font-black">Tugas Sudah Terkumpul</p>
                            <p className="text-emerald-600/70 text-xs font-bold uppercase tracking-widest">Terima kasih atas kerja kerasmu!</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
