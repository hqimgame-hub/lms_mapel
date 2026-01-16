import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateMaterial } from "@/components/teacher/CreateMaterial";
import { EditMaterialModal } from "@/components/teacher/EditMaterialModal";
import { DeleteButton } from "@/components/teacher/DeleteButton";
import { deleteMaterial } from "@/actions/materials";
import { MaterialsListClient } from "@/components/teacher/MaterialsListClient";

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

            <MaterialsListClient initialMaterials={materials} />
        </div>
    );
}
