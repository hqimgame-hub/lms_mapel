import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { GraduationCap, Calendar, ChevronRight, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";
import { CreateExam } from "@/components/teacher/CreateExam";
import { EditExamModal } from "@/components/teacher/EditExamModal";
import { DeleteButton } from "@/components/teacher/DeleteButton";
import { deleteExam } from "@/actions/exams";

export default async function TeacherExamsPage() {
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

    // Fetch all exams across all classes
    const exams = await prisma.exam.findMany({
        where: {
            course: { teacherId }
        },
        include: {
            course: {
                include: {
                    class: true,
                    subject: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Ujian</h1>
                    <p className="text-slate-500 font-medium">Buat dan bagikan link ujian Google Form ke berbagai kelas.</p>
                </div>
                <CreateExam
                    courseId=""
                    teacherCourses={teacherCourses.map(c => ({
                        id: c.id,
                        name: `${c.subject.name} - ${c.class.name}`
                    }))}
                />
            </div>

            <div className="grid gap-4">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    {exam.course.class.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest">
                                    {exam.course.subject.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                                    Google Form
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{exam.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-400 text-xs font-medium">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Clock size={14} />
                                    Mulai: {exam.startTime ? format(new Date(exam.startTime), 'd MMM HH:mm') : '-'}
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                    <Clock size={14} />
                                    Selesai: {exam.endTime ? format(new Date(exam.endTime), 'd MMM HH:mm') : '-'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Tenggat (Legacy): {exam.dueDate ? format(new Date(exam.dueDate), 'PPP') : 'Tidak Ada'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <EditExamModal exam={exam} />
                                <DeleteButton
                                    id={exam.id}
                                    courseId={exam.courseId}
                                    onDelete={deleteExam}
                                />
                            </div>
                            <div className="flex gap-2">
                                {exam.link && (
                                    <a
                                        href={exam.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        <ExternalLink size={16} />
                                        Buka Link
                                    </a>
                                )}
                                <Link
                                    href={`/teacher/courses/${exam.courseId}?tab=exams`}
                                    className="flex items-center gap-2 bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                                >
                                    Lihat di Kelas
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                        Belum ada ujian yang dibuat. Klik tombol di atas untuk membuat ujian pertama Anda.
                    </div>
                )}
            </div>
        </div>
    );
}
