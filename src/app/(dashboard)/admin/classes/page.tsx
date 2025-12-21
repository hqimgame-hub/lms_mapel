import { AddClassForm } from "@/components/admin/AddClassForm";
import { DeleteClassButton } from "@/components/admin/DeleteClassButton";
import { EditClassModal } from "@/components/admin/EditClassModal";
import { prisma } from "@/lib/prisma";

export default async function AdminClassesPage() {
    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { students: true, courses: true } }
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Kelas</h1>

            <AddClassForm />

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
    );
}
