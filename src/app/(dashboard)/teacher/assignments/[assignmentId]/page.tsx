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
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <Link href={`/teacher/courses/${assignment.courseId}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
                    &larr; Kembali ke Kursus
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assignment.title}</h1>
                        <p className="text-gray-600 dark:text-slate-400 mt-1 max-w-2xl">{assignment.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-slate-400">Tenggat Waktu</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{format(assignment.dueDate, 'PPP')}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700 dark:text-slate-200">Pengumpulan Siswa ({submissions.length}/{students.length})</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-gray-500 dark:text-slate-400">
                        <tr>
                            <th className="p-4">Siswa</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Jawaban</th>
                            <th className="p-4">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {students.map(student => {
                            const sub = submissionMap.get(student.id);
                            const isDraft = sub?.status === 'DRAFT';
                            const isSubmitted = sub?.status === 'SUBMITTED' || sub?.status === 'GRADED';
                            const isGraded = sub?.status === 'GRADED';
                            const isLate = isSubmitted && sub?.submittedAt ? new Date(sub.submittedAt) > new Date(assignment.dueDate) : false;

                            return (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                                        {student.name}
                                        <div className="text-xs text-gray-400 dark:text-slate-500 font-normal">{student.username}</div>
                                    </td>
                                    <td className="p-4">
                                        {isGraded ? (
                                            <span className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">Dinilai</span>
                                        ) : isSubmitted ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isLate ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                                                {isLate ? 'Terlambat' : 'Diserahkan'}
                                            </span>
                                        ) : isDraft ? (
                                            <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full text-xs font-bold">
                                                Draft
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-bold">
                                                Belum
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {isSubmitted ? (
                                            <div className="space-y-2">
                                                {sub?.fileUrl && (
                                                    <a
                                                        href={sub.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary font-bold hover:underline flex items-center gap-1.5"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                                        Buka Tugas
                                                    </a>
                                                )}
                                                {sub?.content ? (
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {sub.content}
                                                        </div>
                                                        <AnswerModal
                                                            studentName={student.name}
                                                            assignmentTitle={assignment.title}
                                                            content={sub.content}
                                                            submittedAt={sub.submittedAt}
                                                        />
                                                    </div>
                                                ) : (
                                                    !sub?.fileUrl && <span className="text-gray-400 dark:text-slate-500 italic">Tidak ada konten</span>
                                                )}
                                            </div>
                                        ) : isDraft ? (
                                            <span className="text-gray-400 dark:text-slate-500 italic text-xs">Konten draft disembunyikan</span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-slate-600">-</span>
                                        )}
                                        {sub?.submittedAt && isSubmitted && (
                                            <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{format(sub.submittedAt, 'MMM d, p')}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {isSubmitted ? (
                                            <GradeForm
                                                submissionId={sub!.id}
                                                assignmentId={assignmentId}
                                                initialGrade={sub!.grade}
                                                initialFeedback={sub!.feedback}
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-300 dark:text-slate-600">Belum bisa dinilai</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
