import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { Layers, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateAssignment } from "@/components/teacher/CreateAssignment";
import { EditAssignmentModal } from "@/components/teacher/EditAssignmentModal";
import { DeleteButton } from "@/components/teacher/DeleteButton";
import { deleteAssignment } from "@/actions/assignments";

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
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Tugas</h1>
                    <p className="text-slate-500 font-medium">Kelola dan bagikan tugas ke berbagai kelas Anda.</p>
                </div>
                <CreateAssignment
                    courseId="" // Empty because we use multi-select now
                    teacherCourses={teacherCourses.map(c => ({
                        id: c.id,
                        name: `${c.subject.name} - ${c.class.name}`
                    }))}
                />
            </div>

            <div className="grid gap-4">
                {assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {assignment.course.class.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                    {assignment.course.subject.name}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{assignment.title}</h3>
                            <div className="flex items-center gap-4 mt-3 text-slate-400 text-xs font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Tenggat: {format(new Date(assignment.dueDate), 'PPP')}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Layers size={14} />
                                    {assignment._count.submissions} Pengumpulan
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <EditAssignmentModal assignment={assignment} />
                                <DeleteButton
                                    id={assignment.id}
                                    courseId={assignment.courseId}
                                    onDelete={deleteAssignment}
                                />
                            </div>
                            <Link
                                href={`/teacher/assignments/${assignment.id}`}
                                className="flex items-center gap-2 bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                            >
                                Detail & Menilai
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}

                {assignments.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                        Belum ada tugas yang dibuat. Klik tombol di atas untuk membuat tugas pertama Anda.
                    </div>
                )}
            </div>
        </div>
    );
}
