import { AddSubjectForm } from "@/components/admin/AddSubjectForm";
import { DeleteSubjectButton } from "@/components/admin/DeleteSubjectButton";
import { EditSubjectModal } from "@/components/admin/EditSubjectModal";
import { prisma } from "@/lib/prisma";
import { BookOpen, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminSubjectsPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab = 'list' } = await searchParams;

    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Mata Pelajaran</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manajemen kurikulum dan daftar mata pelajaran yang tersedia.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-[1.5rem] w-fit border border-slate-200 dark:border-slate-800 transition-colors">
                <Link
                    href="?tab=list"
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${tab === 'list'
                            ? "bg-white dark:bg-slate-900 text-primary shadow-md shadow-primary/5 border border-primary/10 dark:border-primary/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80"
                        }`}
                >
                    <BookOpen size={18} />
                    Daftar Mapel
                </Link>
                <Link
                    href="?tab=create"
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${tab === 'create'
                            ? "bg-white dark:bg-slate-900 text-primary shadow-md shadow-primary/5 border border-primary/10 dark:border-primary/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80"
                        }`}
                >
                    <PlusCircle size={18} />
                    Tambah Mapel
                </Link>
            </div>

            {tab === 'create' ? (
                <div className="max-w-4xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <AddSubjectForm />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
                                <tr>
                                    <th className="p-6">Nama Mata Pelajaran</th>
                                    <th className="p-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {subjects.map(subject => (
                                    <tr key={subject.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6 font-bold text-slate-900 dark:text-slate-200">{subject.name}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <EditSubjectModal subject={subject} />
                                                <DeleteSubjectButton id={subject.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="p-20 text-center text-slate-400 font-bold bg-white dark:bg-slate-900">
                                            Belum ada mata pelajaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
