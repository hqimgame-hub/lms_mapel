import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { MaterialList } from "@/components/teacher/MaterialList"; // Reuse the display component
import { ExamList } from "@/components/teacher/ExamList"; // Reuse the display component
import Link from "next/link";
import { format } from "date-fns";
import {
    BookOpen,
    ClipboardList,
    GraduationCap,
    ChevronRight,
    ArrowLeft
} from "lucide-react";

export default async function StudentCoursePage({
    params,
    searchParams
}: {
    params: Promise<{ courseId: string }>,
    searchParams: Promise<{ tab?: string }>
}) {
    const { courseId } = await params;
    const { tab = 'assignments' } = await searchParams;
    // Fetch course and session in parallel
    const [session, course] = await Promise.all([
        auth(),
        prisma.course.findUnique({
            where: { id: courseId },
            include: {
                subject: true,
                class: true,
                teacher: true,
                assignments: {
                    orderBy: { dueDate: 'desc' },
                    include: {
                        submissions: {
                            where: { studentId: (await auth())?.user?.id }
                        }
                    }
                },
                materials: { orderBy: { createdAt: 'desc' } },
                exams: { orderBy: { createdAt: 'desc' } }
            }
        })
    ]);

    if (!course) return notFound();

    // Verify Enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_classId: {
                userId: session?.user?.id!,
                classId: course.classId
            }
        }
    });

    if (!enrollment) {
        return (
            <div className="p-8 text-red-500 font-bold text-center bg-white rounded-[2.5rem] border shadow-sm">
                Anda tidak terdaftar di kursus ini.
            </div>
        );
    }

    const tabs = [
        { id: 'assignments', name: 'Tugas', icon: ClipboardList, count: course.assignments.length },
        { id: 'materials', name: 'Materi', icon: BookOpen, count: course.materials.length },
        { id: 'exams', name: 'Ujian', icon: GraduationCap, count: course.exams.length },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-bold">
                <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft size={16} />
                    Dashboard
                </Link>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-800">{course.subject.name}</span>
            </nav>

            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />
                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
                        Ruang Belajar Siswa
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{course.subject.name}</h1>
                    <p className="text-slate-500 mt-2 font-medium">Guru Pengajar: <span className="text-slate-800 font-bold">{course.teacher.name}</span></p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-100">
                {tabs.map((t) => (
                    <Link
                        key={t.id}
                        href={`?tab=${t.id}`}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${tab === t.id
                            ? 'bg-white text-primary shadow-md shadow-primary/5 border border-primary/10'
                            : 'text-slate-500 hover:bg-white hover:text-slate-700'
                            }`}
                    >
                        <t.icon size={18} />
                        {t.name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tab === t.id ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
                            }`}>
                            {t.count}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {tab === 'assignments' && (
                    <div className="grid gap-4">
                        {course.assignments.map(assignment => {
                            const submission = assignment.submissions[0];
                            const isSubmitted = submission?.status === 'SUBMITTED' || submission?.status === 'GRADED';
                            const isDraft = submission?.status === 'DRAFT';
                            const isGraded = submission?.status === 'GRADED';
                            const isLate = !isSubmitted && new Date() > new Date(assignment.dueDate);

                            return (
                                <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="group">
                                    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-primary/30 hover:shadow-xl transition-all relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                                                    {assignment.title}
                                                </h3>
                                            </div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                                Tenggat: {format(assignment.dueDate, 'PPP p')}
                                            </p>
                                            <p className="text-slate-500 text-sm line-clamp-2">{assignment.description || 'Tidak ada deskripsi'}</p>
                                        </div>

                                        <div className="flex items-center">
                                            {isGraded ? (
                                                <span className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                                                    Nilai: {submission.grade}/100
                                                </span>
                                            ) : isSubmitted ? (
                                                <span className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                                                    Terkirim
                                                </span>
                                            ) : isDraft ? (
                                                <span className="bg-orange-50 text-orange-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-orange-100">
                                                    Draft
                                                </span>
                                            ) : isLate ? (
                                                <span className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100">
                                                    Terlambat
                                                </span>
                                            ) : (
                                                <span className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-primary transition-colors">
                                                    Kerjakan
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                        {course.assignments.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-bold">
                                Belum ada tugas untuk saat ini.
                            </div>
                        )}
                    </div>
                )}

                {tab === 'materials' && (
                    <MaterialList materials={course.materials} />
                )}

                {tab === 'exams' && (
                    <ExamList exams={course.exams} />
                )}
            </div>
        </div>
    );
}
