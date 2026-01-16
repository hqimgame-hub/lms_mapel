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

export default async function TeacherAssignmentsPage() {
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
}
