import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GradeRecap } from "@/components/teacher/GradeRecap";
import { ensureDbColumns } from "@/lib/auto-migrate";

export default async function TeacherRecapPage() {
    const session = await auth();
    const teacherId = session?.user?.id;

    if (!teacherId) return null;

    // Self-heal: ensure all required columns exist in the database
    await ensureDbColumns();

    let courses;
    try {
        courses = await prisma.course.findMany({
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
                            select: { studentId: true, grade: true, teacherTag: true, teacherNote: true }
                        }
                    }
                }
            }
        });
    } catch (e: any) {
        console.warn("Recap query failed, executing fallback ALTER TABLE...", e);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherTag" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "teacherNote" TEXT;`);
        courses = await prisma.course.findMany({
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
                            select: { studentId: true, grade: true, teacherTag: true, teacherNote: true }
                        }
                    }
                }
            }
        });
    }

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
