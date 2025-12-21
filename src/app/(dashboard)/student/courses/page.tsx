import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";

export default async function StudentCoursesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    // Fetch student's class and courses
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
                                    teacher: true,
                                    _count: {
                                        select: {
                                            materials: true,
                                            assignments: true,
                                            exams: true
                                        }
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
    const courses = currentClass.courses;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Mata Pelajaran</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Temukan materi belajar dan tugas di setiap mata pelajaran kelas {currentClass.name}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        href={`/student/courses/${course.id}`}
                        className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-start">
                            <div className="bg-primary/5 p-4 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                                <BookOpen size={32} />
                            </div>
                            <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors tracking-tight leading-tight mb-2">
                                {course.subject.name}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{course.teacher.name}</p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Materi</p>
                                    <p className="font-black text-slate-800">{course._count.materials}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tugas</p>
                                    <p className="font-black text-slate-800">{course._count.assignments}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Ujian</p>
                                    <p className="font-black text-slate-800">{course._count.exams}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center gap-4">
                    <div className="bg-white p-6 rounded-full shadow-sm text-slate-300">
                        <GraduationCap size={48} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Belum ada mata pelajaran</h3>
                        <p className="text-slate-400 font-medium">Mata pelajaran untuk kelasmu belum dikonfigurasi oleh guru.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
