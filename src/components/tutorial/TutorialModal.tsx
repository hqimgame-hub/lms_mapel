'use client';

import { useState, useEffect } from 'react';
import { TutorialTopicData, TutorialItemData } from '@/actions/tutorials';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import {
    HelpCircle,
    X,
    Play,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Video,
    FileText,
    Sparkles,
    PlayCircle
} from 'lucide-react';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    topics: TutorialTopicData[];
}

export function TutorialModal({ isOpen, onClose, topics }: TutorialModalProps) {
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
    const [activeVideo, setActiveVideo] = useState<{ id: string; title: string; url: string } | null>(null);

    // Auto-expand first topic if only one exists
    useEffect(() => {
        if (isOpen && topics.length > 0 && !expandedTopicId) {
            setExpandedTopicId(topics[0].id);
        }
        if (!isOpen) {
            setActiveVideo(null);
        }
    }, [isOpen, topics]);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeVideo) {
                    setActiveVideo(null);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, activeVideo, onClose]);

    if (!isOpen) return null;

    const toggleTopic = (topicId: string) => {
        setExpandedTopicId(prev => prev === topicId ? null : topicId);
    };

    const handleItemClick = (item: TutorialItemData) => {
        if (item.type === 'YOUTUBE') {
            const embedUrl = getYouTubeEmbedUrl(item.url);
            if (embedUrl) {
                setActiveVideo({
                    id: item.id,
                    title: item.title,
                    url: embedUrl
                });
            } else {
                window.open(item.url, '_blank', 'noopener,noreferrer');
            }
        } else {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => {
                    if (activeVideo) {
                        setActiveVideo(null);
                    } else {
                        onClose();
                    }
                }}
            />

            {/* Modal Dialog Container */}
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200 transition-colors">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 md:px-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent dark:from-slate-800/50 dark:to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                            <Sparkles size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Panduan & Tutorial Siswa
                            </h2>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Video panduan dan langkah-langkah penggunaan LMS
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        aria-label="Tutup Modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                    
                    {/* Active Video Player Section */}
                    {activeVideo && (
                        <div className="bg-black/5 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span className="flex items-center gap-2 truncate">
                                    <Video size={16} className="text-red-500 flex-shrink-0" />
                                    <span className="truncate">{activeVideo.title}</span>
                                </span>
                                <button
                                    onClick={() => setActiveVideo(null)}
                                    className="text-primary dark:text-blue-400 hover:underline flex-shrink-0 ml-2 text-[11px]"
                                >
                                    Tutup Pemutar
                                </button>
                            </div>
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                                <iframe
                                    src={activeVideo.url}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            </div>
                        </div>
                    )}

                    {/* Topics List */}
                    {topics.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <HelpCircle size={32} />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                Belum Ada Tutorial Tersedia
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                                Admin belum menambahkan materi panduan untuk saat ini. Silakan hubungi pengajar atau admin jika butuh bantuan.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topics.map((topic, index) => {
                                const isExpanded = expandedTopicId === topic.id;
                                return (
                                    <div
                                        key={topic.id}
                                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                                            isExpanded
                                                ? 'border-primary/40 dark:border-primary/30 bg-blue-50/20 dark:bg-slate-800/40 shadow-sm'
                                                : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        {/* Topic Header Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => toggleTopic(topic.id)}
                                            className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black flex-shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white leading-snug">
                                                        {topic.title}
                                                    </h3>
                                                    {topic.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                                                            {topic.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                                                    {topic.items.length} materi
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp size={18} className="text-primary" />
                                                ) : (
                                                    <ChevronDown size={18} className="text-slate-400" />
                                                )}
                                            </div>
                                        </button>

                                        {/* Topic Items (Expanded) */}
                                        {isExpanded && (
                                            <div className="px-4 md:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                                                {topic.items.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic py-2">
                                                        Belum ada link/video di dalam topik ini.
                                                    </p>
                                                ) : (
                                                    topic.items.map(item => {
                                                        const isYoutube = item.type === 'YOUTUBE';
                                                        const isCurrentlyPlaying = activeVideo?.id === item.id;

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => handleItemClick(item)}
                                                                className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                                    isCurrentlyPlaying
                                                                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
                                                                        : 'bg-white dark:bg-slate-900/70 border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/70'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                                                    <div
                                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                                                                            isYoutube
                                                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                                                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                        }`}
                                                                    >
                                                                        {isYoutube ? <PlayCircle size={20} /> : <FileText size={18} />}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                                                                            {item.title}
                                                                        </div>
                                                                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
                                                                            <span>{isYoutube ? 'Video YouTube' : 'Artikel / Blog'}</span>
                                                                            <span>•</span>
                                                                            <span>{isYoutube ? 'Putar Langsung' : 'Buka Halaman'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex-shrink-0 text-slate-400 group-hover:text-primary transition-colors">
                                                                    {isYoutube ? (
                                                                        <Play size={16} className="fill-current" />
                                                                    ) : (
                                                                        <ExternalLink size={16} />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 px-6 md:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
                    <span>💡 Klik salah satu topik di atas untuk melihat detail bantuan</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
