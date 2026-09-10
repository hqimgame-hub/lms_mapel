import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GradeRecap } from "@/components/teacher/GradeRecap";
import { ensureDbColumns } from "@/lib/auto-migrate";

export const dynamic = 'force-dynamic';

export default async function TeacherRecapPage() {
    try {
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
    } catch (error: any) {
        if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.digest?.startsWith('NEXT_') || error?.message?.includes('NEXT_')) {
            throw error;
        }
        console.error("CRITICAL ERROR IN TeacherRecapPage:", error);
        return (
            <div className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl max-w-4xl mx-auto space-y-4 my-8">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-xl font-black">Gagal Memuat Rekap Nilai</h2>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                    Detail Error: <span className="font-mono text-red-600 dark:text-red-400">{error?.message || String(error)}</span>
                </p>
                {error?.stack && (
                    <pre className="p-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950 rounded-xl text-xs font-mono text-red-500 overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
                    </pre>
                )}
            </div>
        );
    }
}
