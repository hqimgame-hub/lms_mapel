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
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Kelola Kelas</h1>

            <AddClassForm />

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Nama Kelas</th>
                            <th className="p-4">Kode</th>
                            <th className="p-4">Siswa</th>
                            <th className="p-4">Mapel</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {classes.map(cls => (
                            <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-900">{cls.name}</td>
                                <td className="p-4"><span className="font-mono bg-gray-100 px-1 rounded">{cls.code}</span></td>
                                <td className="p-4 text-gray-600">{cls._count.students} Siswa</td>
                                <td className="p-4 text-gray-600">{cls._count.courses} Mapel</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditClassModal classData={cls} />
                                        <DeleteClassButton id={cls.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {classes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500 bg-white">
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
