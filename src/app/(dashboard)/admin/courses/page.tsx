import { AddCourseForm } from "@/components/admin/AddCourseForm";
import { DeleteCourseButton } from "@/components/admin/DeleteCourseButton";
import { EditCourseModal } from "@/components/admin/EditCourseModal";
import { prisma } from "@/lib/prisma";

export default async function AdminCoursesPage() {
    const [courses, classes, subjects, teachers] = await Promise.all([
        prisma.course.findMany({
            include: {
                class: true,
                subject: true,
                teacher: true,
            },
            orderBy: { class: { name: 'asc' } }
        }),
        prisma.class.findMany({ orderBy: { name: 'asc' } }),
        prisma.subject.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({
            where: { role: 'TEACHER' },
            orderBy: { name: 'asc' }
        }),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Kelola Kursus (Alokasi Guru)</h1>

            <AddCourseForm classes={classes} subjects={subjects} teachers={teachers} />

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Kelas</th>
                            <th className="p-4 font-medium text-gray-500">Mata Pelajaran</th>
                            <th className="p-4 font-medium text-gray-500">Guru Pengajar</th>
                            <th className="p-4 font-medium text-gray-500 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {courses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-700">{course.class.name}</td>
                                <td className="p-4">{course.subject.name}</td>
                                <td className="p-4 text-blue-600 font-medium">{course.teacher.name}</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditCourseModal
                                            course={course}
                                            classes={classes}
                                            subjects={subjects}
                                            teachers={teachers}
                                        />
                                        <DeleteCourseButton courseId={course.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                    Belum ada alokasi kursus.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
