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

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{assignment.title}</h1>
                        <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span>{assignment.course.subject.name}</span>
                            <span>•</span>
                            <span>{assignment.course.teacher.name}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase tracking-widest text-[10px]">Tenggat Waktu</div>
                        <div className={`font-semibold ${new Date() > new Date(assignment.dueDate) ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                            {format(assignment.dueDate, 'PPP p')}
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 mb-8 border-b dark:border-slate-800 pb-8 transition-colors">
                    {assignment.description || <p className="italic text-slate-400 dark:text-slate-500">Tidak ada instruksi.</p>}
                </div>

                {/* Grade Display */}
                {submission?.status === 'GRADED' && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4 transition-colors">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{submission.grade}/100</div>
                        </div>
                        <div>
                            <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-widest text-[10px]">Dinilai</div>
                            <p className="text-emerald-700 dark:text-emerald-400 text-sm">{submission.feedback || "Kerja bagus!"}</p>
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
