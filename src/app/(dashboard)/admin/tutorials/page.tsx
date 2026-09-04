import { getAllTutorialsAdmin } from "@/actions/tutorials";
import {
    AddTutorialTopicModal,
    EditTutorialTopicModal,
    DeleteTutorialTopicButton,
    ToggleTutorialStatusButton
} from "@/components/admin/tutorials/TutorialForms";
import { HelpCircle, Layers, Video, FileText, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AdminTutorialsPage() {
    const topics = await getAllTutorialsAdmin();

    const getPlacementBadge = (placement: string) => {
        switch (placement) {
            case 'LOGIN':
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Login Saja
                    </span>
                );
            case 'DASHBOARD':
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        Dashboard Saja
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        Login & Dashboard
                    </span>
                );
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        Panduan & Tutorial Siswa
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                        Kelola materi panduan, video YouTube, dan link blog bantuan untuk siswa.
                    </p>
                </div>

                <div>
                    <AddTutorialTopicModal />
                </div>
            </div>

            {/* Topics Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
                            <tr>
                                <th className="p-6">Topik & Judul Panduan</th>
                                <th className="p-6">Penempatan</th>
                                <th className="p-6 text-center">Isi Konten</th>
                                <th className="p-6 text-center">Status</th>
                                <th className="p-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {topics.map(topic => (
                                <tr key={topic.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <Link
                                                href={`/admin/tutorials/${topic.id}`}
                                                className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary transition-colors flex items-center gap-1.5"
                                            >
                                                <span>{topic.title}</span>
                                                <ChevronRight size={14} className="text-slate-400" />
                                            </Link>
                                            {topic.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                                    {topic.description}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 whitespace-nowrap">
                                        {getPlacementBadge(topic.placement)}
                                    </td>
                                    <td className="p-6 text-center whitespace-nowrap">
                                        <Link
                                            href={`/admin/tutorials/${topic.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-slate-100 hover:bg-primary/10 hover:text-primary dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            <Layers size={14} />
                                            <span>{topic._count.items} Tautan / Video</span>
                                        </Link>
                                    </td>
                                    <td className="p-6 text-center whitespace-nowrap">
                                        <ToggleTutorialStatusButton
                                            id={topic.id}
                                            isActive={topic.isActive}
                                        />
                                    </td>
                                    <td className="p-6 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/admin/tutorials/${topic.id}`}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mr-1"
                                            >
                                                Kelola Isi
                                            </Link>
                                            <EditTutorialTopicModal topic={topic} />
                                            <DeleteTutorialTopicButton id={topic.id} title={topic.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {topics.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <HelpCircle size={24} />
                                            </div>
                                            <p className="font-bold text-sm">Belum ada topik panduan siswa.</p>
                                            <p className="text-xs">Klik tombol &ldquo;Tambah Topik Panduan&rdquo; untuk mulai membuat materi panduan.</p>
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
