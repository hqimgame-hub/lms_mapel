import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { GradeForm } from "@/components/teacher/GradeForm";
import { AnswerModal } from "@/components/teacher/AnswerModal";
import Link from "next/link";
import { format } from "date-fns";

export default async function AssignmentGradingPage({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = await params;
    const session = await auth();

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            course: {
                include: {
                    class: {
                        include: {
                            students: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!assignment) return notFound();
    if (assignment.course.teacherId !== session?.user?.id) {
        return <div className="p-8 text-red-500">Unauthorized Access</div>;
    }

    // Fetch all submissions for this assignment
    const submissions = await prisma.submission.findMany({
        where: { assignmentId },
        include: { student: true }
    });

    // Create a map for easy access
    const submissionMap = new Map(submissions.map(s => [s.studentId, s]));

    const students = assignment.course.class.students.map(e => e.user).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
                <Link href={`/teacher/courses/${assignment.courseId}`} className="text-xs font-black uppercase tracking-widest text-primary hover:text-blue-700 mb-4 inline-flex items-center gap-2">
                    <span className="text-lg">←</span> Kembali ke Kursus
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{assignment.title}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">{assignment.description}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 min-w-[200px]">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Tenggat Waktu</div>
                        <div className="font-black text-slate-800 dark:text-slate-200">{format(new Date(assignment.dueDate), 'PPP')}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">Pengumpulan Siswa</h2>
                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{submissions.length} dari {students.length} Siswa Telah Mengumpulkan</p>
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 px-2">
                    {students.map(student => {
                        const sub = submissionMap.get(student.id);
                        const isDraft = sub?.status === 'DRAFT';
                        const isSubmitted = sub?.status === 'SUBMITTED' || sub?.status === 'GRADED';
                        const isGraded = sub?.status === 'GRADED';
                        const isLate = isSubmitted && sub?.submittedAt ? new Date(sub.submittedAt) > new Date(assignment.dueDate) : false;

                        return (
                            <div key={student.id} className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <div className="font-black text-slate-800 dark:text-slate-200">{student.name}</div>
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{student.username}</div>
                                    </div>
                                    <div className="flex-shrink-0 mt-1">
                                        {isGraded ? (
                                            <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Dinilai</span>
                                        ) : isSubmitted ? (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isLate ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                {isLate ? 'Terlambat' : 'Diserahkan'}
                                            </span>
                                        ) : isDraft ? (
                                            <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Draft</span>
                                        ) : (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Belum</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jawaban</p>
                                        {isSubmitted ? (
                                            <div className="space-y-2">
                                                {sub?.fileUrl && (
                                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                                        Buka File Tugas
                                                    </a>
                                                )}
                                                {sub?.content && (
                                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-2">
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{sub.content}</p>
                                                        <AnswerModal studentName={student.name} assignmentTitle={assignment.title} content={sub.content} submittedAt={sub.submittedAt} />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">Belum ada pengumpulan</p>
                                        )}
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penilaian</p>
                                        {isSubmitted ? (
                                            <GradeForm submissionId={sub!.id} assignmentId={assignmentId} initialGrade={sub!.grade} initialFeedback={sub!.feedback} />
                                        ) : (
                                            <div className="text-xs font-bold text-slate-300 dark:text-slate-600">Terbuka saat siswa mengumpulkan</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Siswa</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jawaban</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {students.map(student => {
                                const sub = submissionMap.get(student.id);
                                const isDraft = sub?.status === 'DRAFT';
                                const isSubmitted = sub?.status === 'SUBMITTED' || sub?.status === 'GRADED';
                                const isGraded = sub?.status === 'GRADED';
                                const isLate = isSubmitted && sub?.submittedAt ? new Date(sub.submittedAt) > new Date(assignment.dueDate) : false;

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                        <td className="p-6">
                                            <div className="font-black text-slate-800 dark:text-slate-200">{student.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{student.username}</div>
                                        </td>
                                        <td className="p-6 text-center">
                                            {isGraded ? (
                                                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Dinilai</span>
                                            ) : isSubmitted ? (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLate ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                                    {isLate ? 'Terlambat' : 'Diserahkan'}
                                                </span>
                                            ) : isDraft ? (
                                                <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Draft</span>
                                            ) : (
                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Belum</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {isSubmitted ? (
                                                <div className="flex flex-col gap-2">
                                                    {sub?.fileUrl && (
                                                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1.5 text-xs">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                                            Buka Tugas
                                                        </a>
                                                    )}
                                                    {sub?.content ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic max-w-[200px]">{sub.content}</div>
                                                            <AnswerModal studentName={student.name} assignmentTitle={assignment.title} content={sub.content} submittedAt={sub.submittedAt} />
                                                        </div>
                                                    ) : (!sub?.fileUrl && <span className="text-xs text-slate-300 italic">Kosong</span>)}
                                                </div>
                                            ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                                        </td>
                                        <td className="p-6">
                                            {isSubmitted ? (
                                                <GradeForm submissionId={sub!.id} assignmentId={assignmentId} initialGrade={sub!.grade} initialFeedback={sub!.feedback} />
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">Belum Tersedia</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
