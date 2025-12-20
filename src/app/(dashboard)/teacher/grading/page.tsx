import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { format } from "date-fns";
import { CheckSquare, Clock, User, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

import { GradeRecap } from "@/components/teacher/GradeRecap";

export default async function TeacherGradingPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const session = await auth();
    const teacherId = session?.user?.id;
    const { tab = 'queue' } = await searchParams;

    if (!teacherId) return null;

    // Fetch data based on tab
    let pendingSubmissions: any[] = [];
    let recapCourses: any[] = [];

    if (tab === 'queue') {
        pendingSubmissions = await prisma.submission.findMany({
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
    } else {
        recapCourses = await prisma.course.findMany({
            where: { teacherId },
            include: {
                subject: true,
                class: {
                    include: {
                        students: {
                            include: { user: true },
                            orderBy: { user: { name: 'asc' } }
                        }
                    }
                },
                assignments: {
                    orderBy: { dueDate: 'asc' },
                    include: {
                        submissions: {
                            select: { studentId: true, grade: true }
                        }
                    }
                }
            }
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Penilaian & Rekap</h1>
                    <p className="text-slate-500 font-medium">Beri nilai tugas masuk atau unduh rekap nilai siswa.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <Link
                        href="?tab=queue"
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'queue' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <CheckSquare size={16} />
                        Antrean
                    </Link>
                    <Link
                        href="?tab=recap"
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'recap' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Trophy size={16} />
                        Rekap Nilai
                    </Link>
                </div>
            </div>

            {tab === 'queue' ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <CheckSquare size={20} />
                            </div>
                            <h2 className="font-bold text-slate-700">Menunggu Penilaian ({pendingSubmissions.length})</h2>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {pendingSubmissions.map((sub) => (
                            <div key={sub.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800">{sub.student.name}</h3>
                                            <span className="text-[10px] font-black uppercase text-slate-400">
                                                {sub.assignment.course.class.name}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 mb-2">
                                            Submisi: <span className="text-slate-900">{sub.assignment.title}</span>
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                Dikumpul: {sub.submittedAt ? format(new Date(sub.submittedAt), 'PPP p') : '-'}
                                            </div>
                                            <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                                {sub.assignment.course.subject.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/teacher/assignments/${sub.assignmentId}`}
                                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    Periksa Sekarang
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}

                        {pendingSubmissions.length === 0 && (
                            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
                                <div className="p-6 bg-emerald-50 text-emerald-500 rounded-full">
                                    <CheckSquare size={48} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Semua Beres!</h4>
                                    <p className="text-sm">Tidak ada tugas yang menunggu untuk dinilai saat ini.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <GradeRecap courses={recapCourses} />
                </div>
            )}
        </div>
    );
}
