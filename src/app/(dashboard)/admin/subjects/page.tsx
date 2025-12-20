import { AddSubjectForm } from "@/components/admin/AddSubjectForm";
import { DeleteSubjectButton } from "@/components/admin/DeleteSubjectButton";
import { EditSubjectModal } from "@/components/admin/EditSubjectModal";
import { prisma } from "@/lib/prisma";

export default async function AdminSubjectsPage() {
    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Kelola Mata Pelajaran</h1>

            <AddSubjectForm />

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Nama Mata Pelajaran</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {subjects.map(subject => (
                            <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-semibold text-gray-900">{subject.name}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditSubjectModal subject={subject} />
                                        <DeleteSubjectButton id={subject.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {subjects.length === 0 && (
                            <tr>
                                <td colSpan={2} className="p-8 text-center text-gray-500">
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
