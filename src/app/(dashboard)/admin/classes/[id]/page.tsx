
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminClassDetailsPage({ params }: { params: { id: string } }) {
    const classId = params.id;

    const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
            courses: {
                include: {
                    subject: true,
                    teacher: true
                }
            }
        }
    });

    if (!classData) return <div>Class not found</div>;

    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        orderBy: { name: 'asc' }
    });

    async function addCourse(formData: FormData) {
        'use server';
        const subjectId = formData.get('subjectId') as string;
        const teacherId = formData.get('teacherId') as string;

        try {
            await prisma.course.create({
                data: {
                    classId,
                    subjectId,
                    teacherId
                }
            });
            revalidatePath(`/admin/classes/${classId}`);
        } catch (e) {
            console.error('Failed to add course', e);
        }
    }

    async function removeCourse(formData: FormData) {
        'use server';
        const courseId = formData.get('courseId') as string;
        try {
            await prisma.course.delete({ where: { id: courseId } });
            revalidatePath(`/admin/classes/${classId}`);
        } catch (e) {
            console.error('Failed to delete course', e);
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Courses for {classData.name}</h1>
                    <p className="text-gray-500">{classData.description} | Code: <span className="font-mono font-bold">{classData.code}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List of Active Courses */}
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b font-semibold">Active Courses</div>
                    <table className="w-full text-left">
                        <thead className="border-b text-sm text-gray-500">
                            <tr>
                                <th className="p-3">Subject</th>
                                <th className="p-3">Teacher</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {classData.courses.map(course => (
                                <tr key={course.id}>
                                    <td className="p-3 font-medium">{course.subject.name}</td>
                                    <td className="p-3 text-sm">{course.teacher.name}</td>
                                    <td className="p-3">
                                        <form action={removeCourse}>
                                            <input type="hidden" name="courseId" value={course.id} />
                                            <button className="text-red-500 text-xs hover:underline">Remove</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {classData.courses.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500 text-sm">
                                        No courses assigned yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add New Course Form */}
                <div className="bg-white p-6 rounded-lg border h-fit">
                    <h2 className="text-lg font-semibold mb-4">Assign Subject & Teacher</h2>
                    <form action={addCourse} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Subject</label>
                            <select name="subjectId" className="w-full border p-2 rounded" required>
                                <option value="">Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Teacher</label>
                            <select name="teacherId" className="w-full border p-2 rounded" required>
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="bg-primary text-white p-2 rounded hover:bg-blue-600 transition mt-2">
                            Add Course
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
