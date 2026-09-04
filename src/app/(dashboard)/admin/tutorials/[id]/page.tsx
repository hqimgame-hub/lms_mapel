import { prisma } from "@/lib/prisma";
import {
    AddTutorialItemModal,
    EditTutorialItemModal,
    DeleteTutorialItemButton,
    EditTutorialTopicModal,
    ToggleTutorialStatusButton
} from "@/components/admin/tutorials/TutorialForms";
import { ArrowLeft, Video, FileText, ExternalLink, HelpCircle, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminTutorialTopicDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    
    const topic = await prisma.tutorialTopic.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!topic) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation Back & Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/admin/tutorials"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Daftar Panduan</span>
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 border border-blue-200/50 dark:border-blue-800">
                                Topik Panduan
                            </span>
                            <ToggleTutorialStatusButton id={topic.id} isActive={topic.isActive} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            {topic.title}
                        </h1>
                        {topic.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
                                {topic.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <EditTutorialTopicModal topic={topic} />
                        <AddTutorialItemModal topicId={topic.id} />
                    </div>
                </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Layers size={18} className="text-primary" />
                        <h2 className="font-black text-base text-slate-800 dark:text-slate-200">
                            Daftar Video & Tautan Panduan ({topic.items.length})
                        </h2>
                    </div>
                    <AddTutorialItemModal topicId={topic.id} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
                            <tr>
                                <th className="p-6">Tipe Konten</th>
                                <th className="p-6">Judul Materi</th>
                                <th className="p-6">Tautan / URL</th>
                                <th className="p-6 text-center">Urutan</th>
                                <th className="p-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {topic.items.map(item => {
                                const isYoutube = item.type === 'YOUTUBE';
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                                                isYoutube
                                                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                                                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                                            }`}>
                                                {isYoutube ? <Video size={14} /> : <FileText size={14} />}
                                                <span>{isYoutube ? 'Video YouTube' : 'Artikel/Blog'}</span>
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                {item.title}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-primary dark:text-blue-400 hover:underline max-w-xs truncate"
                                            >
                                                <span className="truncate">{item.url}</span>
                                                <ExternalLink size={12} className="flex-shrink-0" />
                                            </a>
                                        </td>
                                        <td className="p-6 text-center whitespace-nowrap">
                                            <span className="font-bold text-xs text-slate-500 dark:text-slate-400">
                                                {item.order}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <EditTutorialItemModal item={item} />
                                                <DeleteTutorialItemButton
                                                    id={item.id}
                                                    topicId={topic.id}
                                                    title={item.title}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {topic.items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <HelpCircle size={24} />
                                            </div>
                                            <p className="font-bold text-sm">Belum ada video atau tautan di topik ini.</p>
                                            <p className="text-xs">Klik tombol &ldquo;Tambah Link / Video&rdquo; di atas untuk menambahkan konten.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
