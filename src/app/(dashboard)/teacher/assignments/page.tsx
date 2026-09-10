import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { Layers, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateAssignment } from "@/components/teacher/CreateAssignment";
import { EditAssignmentModal } from "@/components/teacher/EditAssignmentModal";
import { DeleteButton } from "@/components/teacher/DeleteButton";
import { deleteAssignment } from "@/actions/assignments";
import { AssignmentsListClient } from "@/components/teacher/AssignmentsListClient";

export const dynamic = 'force-dynamic';

export default async function TeacherAssignmentsPage() {
    try {
        const session = await auth();
        const teacherId = session?.user?.id;

        if (!teacherId) return null;

        // Fetch all courses taught by this teacher to populate the multi-select
        const teacherCourses = await prisma.course.findMany({
            where: { teacherId },
            include: {
                class: true,
                subject: true,
            }
        });

        // Fetch all assignments across all classes
        const assignments = await prisma.assignment.findMany({
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
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: { dueDate: 'desc' }
        });

        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Tugas</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Kelola dan bagikan tugas ke berbagai kelas Anda.</p>
                    </div>
                    <CreateAssignment
                        courseId="" // Empty because we use multi-select now
                        teacherCourses={teacherCourses.map(c => ({
                            id: c.id,
                            name: `${c.subject.name} - ${c.class.name}`
                        }))}
                    />
                </div>

                <AssignmentsListClient initialAssignments={assignments} />
            </div>
        );
    } catch (error: any) {
        if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.digest?.startsWith('NEXT_') || error?.message?.includes('NEXT_')) {
            throw error;
        }
        console.error("CRITICAL ERROR IN TeacherAssignmentsPage:", error);
        return (
            <div className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl max-w-4xl mx-auto space-y-4 my-8">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-xl font-black">Gagal Memuat Manajemen Tugas</h2>
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
