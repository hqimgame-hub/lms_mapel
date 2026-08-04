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
        type: string;
        attachmentUrl: string | null;
        enableDriveUpload?: boolean;
        driveFolderUrl?: string | null;
    }
}

const initialState = { message: '', success: false, errors: undefined };

export function EditAssignmentModal({ assignment }: EditAssignmentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [enableDrive, setEnableDrive] = useState(assignment.enableDriveUpload || false);
    const [state, formAction, isPending] = useActionState(updateAssignment, initialState);

    useEffect(() => {
        if (state?.success) {
            setIsOpen(false);
        }
    }, [state]);

    useEffect(() => {
        setEnableDrive(assignment.enableDriveUpload || false);
    }, [assignment]);

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
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tipe Tugas</label>
                                <select
                                    name="type"
                                    defaultValue={assignment.type}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-inner"
                                >
                                    <option value="ONLINE">Pengumpulan Online (Siswa Upload File)</option>
                                    <option value="OFFLINE">Penilaian Langsung (Tugas Offline/Praktik)</option>
                                </select>
                                <p className="text-[9px] text-slate-400 ml-1 mt-1">Pilih Penilaian Langsung jika tugas dikerjakan di buku tulis/presentasi.</p>
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

                            {/* Google Drive Upload Setting */}
                            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-800/50 space-y-2.5">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="enableDriveUpload"
                                        value="on"
                                        checked={enableDrive}
                                        onChange={(e) => setEnableDrive(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                            Aktifkan Upload Direct Google Drive
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                                            Siswa dapat mengunggah file dari Komputer Lab / HP tanpa login Google.
                                        </span>
                                    </div>
                                </label>

                                {enableDrive && (
                                    <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                         <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1">
                                             Link Apps Script Web App atau Link Folder Google Drive
                                         </label>
                                         <input
                                             name="driveFolderUrl"
                                             type="text"
                                             defaultValue={assignment.driveFolderUrl || ''}
                                             placeholder="https://script.google.com/macros/s/.../exec atau Link Folder Drive"
                                             className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold text-slate-700 dark:text-slate-200"
                                         />
                                         <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-blue-100 dark:border-blue-900 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                                             <p className="font-bold text-blue-700 dark:text-blue-300">💡 Instruksi untuk Guru:</p>
                                             <p>• Tempel <strong>URL Google Apps Script Web App Anda</strong> (`https://script.google.com/...`) untuk bypass batasan akun Kemdikbud & kuota Drive.</p>
                                             <p>• ATAU tempel Link Folder Drive biasa dan berikan akses Editor ke:</p>
                                             <p className="font-mono bg-slate-100 dark:bg-slate-800 p-1 rounded text-[9px] select-all font-bold text-blue-600 dark:text-blue-400">
                                                 drive-api-lms-tikkka@lms-tik-kka.iam.gserviceaccount.com
                                             </p>
                                         </div>
                                     </div>
                                )}
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
