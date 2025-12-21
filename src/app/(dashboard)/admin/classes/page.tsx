import { AddClassForm } from "@/components/admin/AddClassForm";
import { DeleteClassButton } from "@/components/admin/DeleteClassButton";
import { EditClassModal } from "@/components/admin/EditClassModal";
import { prisma } from "@/lib/prisma";
import { LayoutGrid, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminClassesPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab = 'list' } = await searchParams;

    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { students: true, courses: true } }
        }
    });

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Kelas</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Atur data kelas dan monitor jumlah siswa serta mata pelajaran.</p>
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
                    <LayoutGrid size={18} />
                    Daftar Kelas
                </Link>
                <Link
                    href="?tab=create"
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${tab === 'create'
                            ? "bg-white dark:bg-slate-900 text-primary shadow-md shadow-primary/5 border border-primary/10 dark:border-primary/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80"
                        }`}
                >
                    <PlusCircle size={18} />
                    Tambah Kelas
                </Link>
            </div>

            {tab === 'create' ? (
                <div className="max-w-4xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <AddClassForm />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest">
                                <tr>
                                    <th className="p-6">Nama Kelas</th>
                                    <th className="p-6">Kode</th>
                                    <th className="p-6">Siswa</th>
                                    <th className="p-6">Mapel</th>
                                    <th className="p-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {classes.map(cls => (
                                    <tr key={cls.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6 font-bold text-slate-900 dark:text-slate-200">{cls.name}</td>
                                        <td className="p-6"><span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 text-xs">{cls.code}</span></td>
                                        <td className="p-6 text-slate-500 dark:text-slate-400 font-medium">{cls._count.students} Siswa</td>
                                        <td className="p-6 text-slate-500 dark:text-slate-400 font-medium">{cls._count.courses} Mapel</td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <EditClassModal classData={cls} />
                                                <DeleteClassButton id={cls.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {classes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 font-bold bg-white dark:bg-slate-900">
                                            Belum ada kelas. Buat kelas baru.
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
