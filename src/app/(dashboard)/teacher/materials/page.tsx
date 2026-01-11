import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateMaterial } from "@/components/teacher/CreateMaterial";
import { EditMaterialModal } from "@/components/teacher/EditMaterialModal";
import { DeleteButton } from "@/components/teacher/DeleteButton";
import { deleteMaterial } from "@/actions/materials";

export default async function TeacherMaterialsPage() {
    const session = await auth();
    const teacherId = session?.user?.id;

    if (!teacherId) return null;

    // Fetch all courses taught by this teacher
    const teacherCourses = await prisma.course.findMany({
        where: { teacherId },
        include: {
            class: true,
            subject: true,
        }
    });

    // Fetch all materials across all classes
    const materials = await prisma.material.findMany({
        where: {
            course: { teacherId }
        },
        include: {
            course: {
                include: {
                    class: true,
                    subject: true,
                }
            },
            contents: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Materi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Kumpulkan dan bagikan bahan ajar ke berbagai kelas.</p>
                </div>
                <CreateMaterial
                    courseId=""
                    teacherCourses={teacherCourses.map(c => ({
                        id: c.id,
                        name: `${c.subject.name} - ${c.class.name}`
                    }))}
                />
            </div>

            <div className="grid gap-4">
                {materials.map((material) => (
                    <div key={material.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    {material.course.class.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                    {material.course.subject.name}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{material.title}</h3>
                            <div className="flex items-center gap-4 mt-3 text-slate-400 dark:text-slate-500 text-xs font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Dibuat: {format(new Date(material.createdAt), 'PPP')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <EditMaterialModal material={material} />
                                <DeleteButton
                                    id={material.id}
                                    courseId={material.courseId}
                                    onDelete={deleteMaterial}
                                />
                            </div>
                            <Link
                                href={`/teacher/courses/${material.courseId}?tab=materials`}
                                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                            >
                                Lihat di Kelas
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}

                {materials.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                        Belum ada materi yang dibuat. Klik tombol di atas untuk membagikan materi pertama Anda.
                    </div>
                )}
            </div>
        </div>
    );
}
