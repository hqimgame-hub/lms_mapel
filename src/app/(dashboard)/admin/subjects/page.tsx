import { AddSubjectForm } from "@/components/admin/AddSubjectForm";
import { DeleteSubjectButton } from "@/components/admin/DeleteSubjectButton";
import { EditSubjectModal } from "@/components/admin/EditSubjectModal";
import { prisma } from "@/lib/prisma";

export default async function AdminSubjectsPage() {
    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Mata Pelajaran</h1>

            <AddSubjectForm />

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
    );
}
