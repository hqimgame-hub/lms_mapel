import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { CheckSquare, Clock, User, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

import { GradeRecap } from "@/components/teacher/GradeRecap";

export default async function TeacherGradingPage() {
    const session = await auth();
    const teacherId = session?.user?.id;

    if (!teacherId) return null;

    // Fetch pending submissions only
    const pendingSubmissions = await prisma.submission.findMany({
        where: {
            status: "SUBMITTED",
            assignment: {
                course: { teacherId }
            }
        },
        include: {
            student: true,
            assignment: {
                include: {
                    course: {
                        include: {
                            class: true,
                            subject: true,
                        }
                    }
                }
            }
        },
        orderBy: { submittedAt: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Antrean Penilaian</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Beri nilai tugas yang baru saja dikumpulkan oleh siswa.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                            <CheckSquare size={20} />
                        </div>
                        <h2 className="font-bold text-slate-700 dark:text-slate-200">Menunggu Penilaian ({pendingSubmissions.length})</h2>
                    </div>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {pendingSubmissions.map((sub) => (
                        <div key={sub.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 transition-colors">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{sub.student.name}</h3>
                                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                                            {sub.assignment.course.class.name}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                        Submisi: <span className="text-slate-900 dark:text-slate-100 font-bold">{sub.assignment.title}</span>
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            Dikumpul: {sub.submittedAt ? format(new Date(sub.submittedAt), 'PPP p') : '-'}
                                        </div>
                                        <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded transition-colors">
                                            {sub.assignment.course.subject.name}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/teacher/assignments/${sub.assignmentId}`}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
                            >
                                Periksa Jetzt
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}

                    {pendingSubmissions.length === 0 && (
                        <div className="text-center py-24 text-slate-400 flex flex-col items-center gap-4">
                            <div className="p-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full transition-colors">
                                <CheckSquare size={56} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white text-lg">Semua Beres!</h4>
                                <p className="text-sm font-medium">Tidak ada tugas yang menunggu untuk dinilai saat ini.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
