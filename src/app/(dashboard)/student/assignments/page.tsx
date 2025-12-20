import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen, Calendar, Clock, CheckCircle, ChevronRight, Filter } from "lucide-react";
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
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Daftar Tugas 📝</h1>
                    <p className="text-slate-500 font-medium">Lihat semua tugas dari setiap mata pelajaran di kelas {currentClass.name}.</p>
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
                                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-50 text-emerald-500' :
                                            isDraft ? 'bg-amber-50 text-amber-500' :
                                                isLate ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        {isDone ? <CheckCircle size={24} /> : isLate ? <Calendar size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{assignment.subject}</span>
                                            {isDone && (
                                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Selesai</span>
                                            )}
                                            {isDraft && (
                                                <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Draft</span>
                                            )}
                                            {isLate && (
                                                <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Terlambat</span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-lg">{assignment.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                <Clock size={14} />
                                                <span>Tenggat: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isDone && submission.grade !== null && (
                                        <div className="text-right mr-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai</p>
                                            <p className="text-xl font-black text-emerald-600">{submission.grade}</p>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 p-3 rounded-full text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center gap-4">
                        <div className="bg-white p-6 rounded-full shadow-sm text-slate-300">
                            <ClipboardList size={48} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Belum ada tugas</h3>
                            <p className="text-slate-400 font-medium">Daftar tugasmu masih kosong untuk saat ini.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
