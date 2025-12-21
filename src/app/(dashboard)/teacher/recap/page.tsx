import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GradeRecap } from "@/components/teacher/GradeRecap";

export default async function TeacherRecapPage() {
    const session = await auth();
    const teacherId = session?.user?.id;

    if (!teacherId) return null;

    const courses = await prisma.course.findMany({
        where: { teacherId },
        include: {
            subject: true,
            class: {
                include: {
                    students: {
                        include: { user: true },
                        orderBy: { user: { name: 'asc' } }
                    }
                }
            },
            assignments: {
                orderBy: { dueDate: 'asc' },
                include: {
                    submissions: {
                        select: { studentId: true, grade: true }
                    }
                }
            }
        }
    });

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 transition-colors">
                Anda belum memiliki kelas untuk direkap.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Rekap Nilai</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Buku nilai digital untuk memantau perkembangan seluruh siswa.</p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GradeRecap courses={courses} />
            </div>
        </div>
    );
}
