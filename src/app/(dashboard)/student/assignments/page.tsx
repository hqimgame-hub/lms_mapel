import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, Calendar, Clock, CheckCircle, ChevronRight, Filter, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function StudentAssignmentsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    // Fetch user with enrollment and assignments
    const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    class: {
                        include: {
                            courses: {
                                include: {
                                    subject: true,
                                    assignments: {
                                        include: {
                                            submissions: {
                                                where: { studentId: session.user.id }
                                            }
                                        },
                                        orderBy: { dueDate: 'asc' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student || student.enrollments.length === 0) {
        redirect('/student');
    }

    const currentClass = student.enrollments[0].class;
    const assignments = currentClass.courses.flatMap(c =>
        c.assignments.map(a => ({
            ...a,
            subject: c.subject.name,
            courseId: c.id
        }))
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Daftar Tugas</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Lihat semua tugas dari setiap mata pelajaran di kelas {currentClass.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {assignments.length > 0 ? (
                    assignments.map((assignment) => {
                        const submission = assignment.submissions[0];
                        const isDone = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED';
                        const isDraft = submission?.status === 'DRAFT';
                        const isLate = !isDone && new Date() > new Date(assignment.dueDate);

                        return (
                            <Link
                                key={assignment.id}
                                href={`/student/assignments/${assignment.id}`}
                                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' :
                                        isDraft ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400' :
                                            isLate ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                        }`}>
                                        {isDone ? <CheckCircle size={24} /> : isLate ? <Calendar size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-primary dark:text-blue-400 uppercase tracking-widest">{assignment.subject}</span>
                                            {isDone && (
                                                <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Selesai</span>
                                            )}
                                            {isDraft && (
                                                <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Draft</span>
                                            )}
                                            {isLate && (
                                                <span className="text-[10px] font-black bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Terlambat</span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors text-lg">{assignment.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                                                <Clock size={14} />
                                                <span>Tenggat: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isDone && submission.grade !== null && (
                                        <div className="text-right mr-4">
                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nilai</p>
                                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{submission.grade}</p>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-full text-slate-400 dark:text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-20 text-center flex flex-col items-center gap-4 transition-colors">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm text-slate-300 dark:text-slate-600">
                            <ClipboardList size={48} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Belum ada tugas</h3>
                            <p className="text-slate-400 dark:text-slate-500 font-medium">Daftar tugasmu masih kosong untuk saat ini.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
