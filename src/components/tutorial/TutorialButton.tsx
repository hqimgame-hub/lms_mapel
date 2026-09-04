'use client';

import { useState } from 'react';
import { TutorialTopicData } from '@/actions/tutorials';
import { TutorialModal } from './TutorialModal';
import { HelpCircle, PlayCircle, BookOpen } from 'lucide-react';

interface TutorialButtonProps {
    topics: TutorialTopicData[];
    variant?: 'button' | 'badge' | 'floating' | 'card';
    className?: string;
    label?: string;
}

export function TutorialButton({
    topics,
    variant = 'button',
    className = '',
    label = 'Panduan Siswa'
}: TutorialButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    // If no active tutorials exist, do not clutter the UI
    if (!topics || topics.length === 0) {
        return null;
    }

    return (
        <>
            {/* VARIANT: BUTTON (Standard button with icon) */}
            {variant === 'button' && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-primary dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20 transition-all shadow-sm active:scale-95 ${className}`}
                >
                    <HelpCircle size={16} />
                    <span>{label}</span>
                </button>
            )}

            {/* VARIANT: BADGE (Compact pill / header item) */}
            {variant === 'badge' && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all active:scale-95 ${className}`}
                >
                    <PlayCircle size={14} className="text-primary dark:text-blue-400" />
                    <span>{label}</span>
                </button>
            )}

            {/* VARIANT: FLOATING (Fixed at bottom corner, ideal for login page or dashboard) */}
            {variant === 'floating' && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-primary via-blue-600 to-blue-700 text-white font-bold text-xs shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group ${className}`}
                    aria-label="Buka Panduan Siswa"
                >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <HelpCircle size={14} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <span className="tracking-wide">{label}</span>
                </button>
            )}

            {/* VARIANT: CARD (Informative callout banner for student dashboard) */}
            {variant === 'card' && (
                <div
                    onClick={() => setIsOpen(true)}
                    className={`cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-5 rounded-[2rem] text-white shadow-lg shadow-blue-500/10 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-between gap-4 group ${className}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-1">
                                <PlayCircle size={12} /> Panduan & Video
                            </div>
                            <h3 className="text-base font-black tracking-tight leading-snug">
                                Butuh Bantuan Menggunakan LMS?
                            </h3>
                            <p className="text-xs text-blue-100 font-medium">
                                Klik di sini untuk menonton video tutorial dan panduan belajar.
                            </p>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 bg-white text-primary px-4 py-2.5 rounded-xl font-black text-xs shadow-sm flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                        Buka Panduan
                    </div>
                </div>
            )}

            {/* Modal */}
            <TutorialModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                topics={topics}
            />
        </>
    );
}
