'use client';

import { useState } from 'react';
import { FileText, X, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

interface AnswerModalProps {
    studentName: string;
    assignmentTitle: string;
    content: string;
    submittedAt: Date | null;
}

export function AnswerModal({ studentName, assignmentTitle, content, submittedAt }: AnswerModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
                <FileText size={14} />
                Lihat Selengkapnya
            </button>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary dark:bg-primary/90 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm tracking-tight">Jawaban Siswa</h3>
                            <p className="text-xs text-white/70 font-medium">{studentName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Assignment Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                            Tugas
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {assignmentTitle}
                        </div>
                        {submittedAt && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Dikumpulkan: {format(new Date(submittedAt), 'PPP p')}
                            </div>
                        )}
                    </div>

                    {/* Answer Content */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Jawaban
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} className="text-green-600" />
                                        <span className="text-green-600">Tersalin!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Salin Teks
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full px-4 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-primary/20 transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
