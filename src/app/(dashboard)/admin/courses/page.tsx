import { AddCourseForm } from "@/components/admin/AddCourseForm";
import { DeleteCourseButton } from "@/components/admin/DeleteCourseButton";
import { EditCourseModal } from "@/components/admin/EditCourseModal";
import { CourseFilters } from "@/components/admin/CourseFilters";
import { BookOpen, GraduationCap, User } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminCoursesPage({
    searchParams
}: {
    searchParams: Promise<{ classId?: string; subjectId?: string; teacherId?: string }>
}) {
    const { classId, subjectId, teacherId } = await searchParams;

    // Build the where clause
    const where: any = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;

    const [courses, classes, subjects, teachers] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                class: true,
                subject: true,
                teacher: true,
            },
            orderBy: [
                { class: { name: 'asc' } },
                { subject: { name: 'asc' } }
            ]
        }),
        prisma.class.findMany({ orderBy: { name: 'asc' } }),
        prisma.subject.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({
            where: { role: 'TEACHER' },
            orderBy: { name: 'asc' }
        }),
    ]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Alokasi Kursus</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Atur pembagian kelas, mata pelajaran, dan penugasan guru pengajar.</p>
            </div>

            <AddCourseForm classes={classes} subjects={subjects} teachers={teachers} />

            <div className="flex flex-col gap-4">
                <CourseFilters classes={classes} subjects={subjects} teachers={teachers} />

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Kelas</th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Mata Pelajaran</th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Guru Pengajar</th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {courses.map(course => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                    <GraduationCap size={16} />
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{course.class.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="font-medium text-slate-600 dark:text-slate-400 text-sm">{course.subject.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                    <User size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.teacher.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <EditCourseModal
                                                    course={course as any}
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
                                        <td colSpan={4} className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold">
                                            Tidak ada alokasi kursus ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
