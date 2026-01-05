import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { CreateAssignment } from "@/components/teacher/CreateAssignment";
import { MaterialList } from "@/components/teacher/MaterialList";
import { CreateMaterial } from "@/components/teacher/CreateMaterial";
import { ExamList } from "@/components/teacher/ExamList";
import { CreateExam } from "@/components/teacher/CreateExam";
import { BookOpen, ClipboardList, GraduationCap, Users, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EditAssignmentModal } from "@/components/teacher/EditAssignmentModal";
import { deleteAssignment } from "@/actions/assignments";
import { DeleteButton } from "@/components/teacher/DeleteButton";

export default async function TeacherCoursePage({
    params,
    searchParams
}: {
    params: Promise<{ courseId: string }>,
    searchParams: Promise<{ tab?: string }>
}) {
    const { courseId } = await params;
    const { tab = 'assignments' } = await searchParams;
    const session = await auth();

    // Security check + Fetch everything in one go
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            subject: true,
            class: {
                include: {
                    students: {
                        include: { user: true }
                    },
                    _count: { select: { students: true } }
                }
            },
            assignments: {
                orderBy: { dueDate: 'desc' },
                include: {
                    _count: { select: { submissions: true } }
                }
            },
            materials: {
                orderBy: { createdAt: 'desc' },
                include: {
                    contents: {
                        orderBy: { order: 'asc' }
                    }
                }
            },
            exams: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!course) return notFound();
    if (course.teacherId !== session?.user?.id) {
        return <div className="p-8 text-red-500 font-bold bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">Akses Tidak Diizinkan</div>;
    }

    const tabs = [
        { id: 'assignments', name: 'Tugas', icon: ClipboardList, count: course.assignments.length },
        { id: 'materials', name: 'Materi', icon: BookOpen, count: course.materials.length },
        { id: 'exams', name: 'Ujian', icon: GraduationCap, count: course.exams.length },
        { id: 'students', name: 'Siswa', icon: Users, count: course.class._count.students },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Breadcrumb & Navigation */}
            <nav className="flex items-center gap-2 text-sm font-bold">
                <Link href="/dashboard" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft size={16} />
                    Dashboard
                </Link>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-800">{course.subject.name}</span>
            </nav>

            {/* Premium Header */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800/50 rounded-full -mr-32 -mt-32 z-0" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                Kelas {course.class.name}
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{course.subject.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-2">
                                <Users size={18} className="text-slate-300 dark:text-slate-600" />
                                {course.class._count.students} Siswa Terdaftar di Rombel ini
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-100 dark:border-slate-800 transition-colors">
                {tabs.map((t) => (
                    <Link
                        key={t.id}
                        href={`?tab=${t.id}`}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${tab === t.id
                            ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-md shadow-primary/5 dark:shadow-none border border-primary/10 dark:border-slate-600'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <t.icon size={18} />
                        {t.name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tab === t.id ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}>
                            {t.count}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {tab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm transition-colors">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Daftar Penugasan</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Kelola tugas dan berikan penilaian kepada siswa.</p>
                            </div>
                            <CreateAssignment courseId={course.id} />
                        </div>

                        <div className="grid gap-4">
                            {course.assignments.map(assignment => (
                                <div key={assignment.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-primary/5 transition-all flex flex-col md:flex-row justify-between gap-6 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-slate-400 dark:text-slate-500 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                                <ClipboardList size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{assignment.title}</h3>
                                            {!assignment.published && (
                                                <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                    Draft
                                                </span>
                                            )}

                                            {new Date(assignment.dueDate) < new Date() && (
                                                <span className="bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-red-100 dark:border-red-500/20">Ditutup</span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 pl-12">{assignment.description || 'Tidak ada deskripsi'}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest pl-12">
                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                                                Tenggat: <span className="text-slate-700 dark:text-slate-300">{format(assignment.dueDate, 'PPP p')}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-50 dark:border-slate-800 pt-6 md:pt-0 md:pl-8">
                                        <div className="text-center bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl min-w-[100px] transition-colors">
                                            <div className="text-2xl font-black text-primary dark:text-blue-400">{assignment._count.submissions}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Kumpulkan</div>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <Link
                                                href={`/teacher/assignments/${assignment.id}`}
                                                className="px-6 py-3 bg-slate-900 dark:bg-primary text-white hover:bg-primary dark:hover:bg-blue-600 rounded-xl text-sm font-bold text-center transition-all shadow-lg shadow-slate-900/10 dark:shadow-primary/20"
                                            >
                                                Mulai Nilai
                                            </Link>
                                            <div className="flex items-center gap-2 justify-center mt-1">
                                                <EditAssignmentModal assignment={assignment} />
                                                <DeleteButton
                                                    id={assignment.id}
                                                    courseId={course.id}
                                                    onDelete={deleteAssignment}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {course.assignments.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
                                    Belum ada tugas dibuat.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'materials' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm transition-colors">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Materi Pembelajaran</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Bagikan bahan ajar, video, atau tautan bermanfaat.</p>
                            </div>
                            <CreateMaterial courseId={course.id} />
                        </div>
                        <MaterialList materials={course.materials} courseId={course.id} isTeacher={true} />
                    </div>
                )}

                {tab === 'exams' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm transition-colors">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Evaluasi & Ujian</h2>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">Ujian melalui Google Form atau evaluasi lainnya.</p>
                            </div>
                            <CreateExam courseId={course.id} />
                        </div>
                        <ExamList exams={course.exams} courseId={course.id} isTeacher={true} />
                    </div>
                )}

                {tab === 'students' && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 font-medium">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white">Siswa Terdaftar</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-xs">Daftar siswa di kelas {course.class.name}.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-4">Nama Siswa</th>
                                        <th className="px-8 py-4">Username/Email</th>
                                        <th className="px-8 py-4">Tanggal Bergabung</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {course.class.students.map((enrollment) => (
                                        <tr key={enrollment.user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all font-bold text-slate-700 dark:text-slate-300 text-sm">
                                            <td className="px-8 py-5 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500">
                                                    {enrollment.user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {enrollment.user.name}
                                            </td>
                                            <td className="px-8 py-5 text-slate-400 dark:text-slate-500 font-medium">{enrollment.user.username}</td>
                                            <td className="px-8 py-5 text-slate-400 dark:text-slate-500 font-medium">{format(new Date(enrollment.joinedAt), 'PPP')}</td>
                                        </tr>
                                    ))}
                                    {course.class.students.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-10 text-center text-slate-400 dark:text-slate-500 italic">Belum ada siswa di rombel ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
