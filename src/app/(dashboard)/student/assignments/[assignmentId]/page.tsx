import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/student/SubmissionForm";
import { format } from "date-fns";
import Link from "next/link";

export default async function StudentAssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
    const { assignmentId } = await params;
    const session = await auth();

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            course: {
                include: {
                    teacher: true,
                    subject: true
                }
            }
        }
    });

    if (!assignment) return notFound();

    // Fetch existing submission
    const submission = await prisma.submission.findUnique({
        where: {
            studentId_assignmentId: {
                studentId: session?.user?.id!,
                assignmentId
            }
        }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href={`/student/courses/${assignment.courseId}`} className="text-sm text-blue-600 hover:underline">
                &larr; Kembali ke Kursus
            </Link>

            <div className="bg-white p-8 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                        <div className="flex gap-2 text-sm text-gray-500">
                            <span>{assignment.course.subject.name}</span>
                            <span>•</span>
                            <span>{assignment.course.teacher.name}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Tenggat Waktu</div>
                        <div className={`font-semibold ${new Date() > new Date(assignment.dueDate) ? 'text-red-600' : 'text-gray-900'}`}>
                            {format(assignment.dueDate, 'PPP p')}
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none text-gray-700 mb-8 border-b pb-8">
                    {assignment.description || <p className="italic text-gray-400">Tidak ada instruksi.</p>}
                </div>

                {/* Grade Display */}
                {submission?.status === 'GRADED' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start gap-4">
                        <div className="bg-white p-3 rounded-full border border-green-100 shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{submission.grade}/100</div>
                        </div>
                        <div>
                            <div className="font-bold text-green-800 mb-1">Dinilai</div>
                            <p className="text-green-700 text-sm">{submission.feedback || "Kerja bagus!"}</p>
                        </div>
                    </div>
                )}

                <SubmissionForm
                    assignmentId={assignment.id}
                    dueDate={assignment.dueDate}
                    initialContent={submission?.content}
                    initialFileUrl={submission?.fileUrl}
                    initialFileName={submission?.fileName}
                    status={submission?.status}
                />
            </div>
        </div>
    );
}
