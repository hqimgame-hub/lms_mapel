import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BarChart3, User, AlertCircle } from "lucide-react";

export default async function TeacherRecapPage({ searchParams }: { searchParams: Promise<{ classId?: string }> }) {
    const { classId } = await searchParams;

    // 1. Fetch courses and session in parallel
    const [courses, session] = await Promise.all([
        prisma.course.findMany({
            where: { teacherId: (await auth())?.user?.id }, // Temporarily fetch teacherId here for the query
            include: { class: true, subject: true }
        }),
        auth() // Fetch session again to get the actual session object
    ]);

    const teacherId = session?.user?.id;

    if (!teacherId) return null;

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                Anda belum memiliki kelas untuk direkap.
            </div>
        );
    }

    // 2. Determine active course
    const activeCourseId = classId || courses[0].id;
    const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0];

    // 3. Fetch specific course data in parallel
    const [students, assignments, submissions] = await Promise.all([
        prisma.user.findMany({
            where: {
                enrollments: { some: { classId: activeCourse.classId } }
            },
            orderBy: { name: 'asc' }
        }),
        prisma.assignment.findMany({
            where: { courseId: activeCourse.id },
            orderBy: { dueDate: 'asc' }
        }),
        prisma.submission.findMany({
            where: { assignment: { courseId: activeCourse.id } }
        })
    ]);

    // Create a map for quick lookup [studentId-assignmentId] -> grade/status
    const submissionMap = new Map();
    submissions.forEach(s => {
        submissionMap.set(`${s.studentId}-${s.assignmentId}`, s);
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rekap Nilai</h1>
                <p className="text-slate-500 font-medium">Buku nilai digital untuk memantau perkembangan seluruh siswa.</p>
            </div>

            {/* Class Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
                {courses.map((course) => (
                    <a
                        key={course.id}
                        href={`/teacher/recap?classId=${course.id}`}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeCourse.id === course.id
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {course.class.name} - {course.subject.name}
                    </a>
                ))}
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 sticky left-0 bg-slate-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10">
                                    Daftar Siswa
                                </th>
                                {assignments.map((assignment) => (
                                    <th key={assignment.id} className="p-6 font-black text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 min-w-[150px] text-center">
                                        {assignment.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 border-r border-slate-50 flex items-center gap-3 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{student.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400">{student.username}</p>
                                        </div>
                                    </td>
                                    {assignments.map((assignment) => {
                                        const sub = submissionMap.get(`${student.id}-${assignment.id}`);
                                        const isGraded = sub?.status === "GRADED";
                                        const isSubmitted = sub?.status === "SUBMITTED";
                                        const isMissing = !sub && new Date(assignment.dueDate) < new Date();

                                        return (
                                            <td key={assignment.id} className="p-6 text-center border-r border-slate-50 last:border-r-0">
                                                {isGraded ? (
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm">
                                                        {sub.grade}
                                                    </div>
                                                ) : isSubmitted ? (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                        Dikumpul
                                                    </span>
                                                ) : isMissing ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <AlertCircle size={14} className="text-red-400" />
                                                        <span className="text-[10px] font-black uppercase text-red-500 tracking-tighter">
                                                            Belum Kumpul
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200 text-sm font-medium">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={assignments.length + 1} className="py-20 text-center text-slate-400 font-medium">
                                        Belum ada siswa yang terdaftar di kelas ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-100 rounded-sm" /> Nilai Akhir
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-50 rounded-sm border border-blue-100" /> Sedang Dinilai
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-50 rounded-sm border border-red-100" /> Melewati Batas Waktu
                </div>
            </div>
        </div>
    );
}
