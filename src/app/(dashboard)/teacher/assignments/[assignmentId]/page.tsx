import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { GradeForm } from "@/components/teacher/GradeForm";
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
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <Link href={`/teacher/courses/${assignment.courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    &larr; Kembali ke Kursus
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-gray-600 mt-1 max-w-2xl">{assignment.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Tenggat Waktu</div>
                        <div className="font-semibold">{format(assignment.dueDate, 'PPP')}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Pengumpulan Siswa ({submissions.length}/{students.length})</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                        <tr>
                            <th className="p-4">Siswa</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Jawaban</th>
                            <th className="p-4">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {students.map(student => {
                            const sub = submissionMap.get(student.id);
                            const isDraft = sub?.status === 'DRAFT';
                            const isSubmitted = sub?.status === 'SUBMITTED' || sub?.status === 'GRADED';
                            const isGraded = sub?.status === 'GRADED';
                            const isLate = isSubmitted && sub?.submittedAt ? new Date(sub.submittedAt) > new Date(assignment.dueDate) : false;

                            return (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium">
                                        {student.name}
                                        <div className="text-xs text-gray-400 font-normal">{student.username}</div>
                                    </td>
                                    <td className="p-4">
                                        {isGraded ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Dinilai</span>
                                        ) : isSubmitted ? (
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${isLate ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {isLate ? 'Terlambat' : 'Diserahkan'}
                                            </span>
                                        ) : isDraft ? (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                                                Draft
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                                                Belum
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {isSubmitted ? (
                                            <div className="space-y-1">
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
                                                    <div className="max-w-xs truncate text-slate-600" title={sub.content}>
                                                        {sub.content}
                                                    </div>
                                                ) : (
                                                    !sub?.fileUrl && <span className="text-gray-400 italic">Tidak ada konten</span>
                                                )}
                                            </div>
                                        ) : isDraft ? (
                                            <span className="text-gray-400 italic text-xs">Konten draft disembunyikan</span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                        {sub?.submittedAt && isSubmitted && (
                                            <div className="text-xs text-gray-400 mt-1">{format(sub.submittedAt, 'MMM d, p')}</div>
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
                                            <span className="text-xs text-gray-300">Belum bisa dinilai</span>
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
