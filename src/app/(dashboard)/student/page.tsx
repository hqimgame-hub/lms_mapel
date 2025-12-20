import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
    ClipboardList,
    CheckCircle,
    Clock,
    AlertCircle,
    BookOpen,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboardPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    // Fetch user with enrollment and assignments
    const student = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    class: {
                        include: {
                            courses: {
                                include: {
                                    subject: true,
                                    assignments: {
                                        include: {
                                            submissions: {
                                                where: { studentId: session.user.id }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student || student.enrollments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="bg-amber-50 p-6 rounded-full text-amber-500">
                    <AlertCircle size={48} />
                </div>
                <h1 className="text-2xl font-black text-slate-800">Belum Terdaftar di Kelas</h1>
                <p className="text-slate-500 max-w-md">Silakan hubungi admin atau pastikan Anda sudah memilih kelas saat mendaftar.</p>
            </div>
        );
    }

    const currentClass = student.enrollments[0].class;
    const allAssignments = currentClass.courses.flatMap(c =>
        c.assignments.map(a => ({ ...a, subject: c.subject.name }))
    );

    const stats = {
        todo: allAssignments.filter(a => a.submissions.length === 0).length,
        draft: allAssignments.filter(a => a.submissions[0]?.status === 'DRAFT').length,
        done: allAssignments.filter(a => a.submissions[0]?.status === 'SUBMITTED' || a.submissions[0]?.status === 'GRADED').length,
    };

    const upcomingAssignments = allAssignments
        .filter(a => a.submissions.length === 0 || a.submissions[0]?.status === 'DRAFT')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Halo, {student.name}! 👋</h1>
                <p className="text-slate-500 font-medium">Selamat datang di dashboard {currentClass.name}. Cek progres belajarmu hari ini.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Belum Selesai</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.todo}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
                    <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Draft Tugas</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.draft}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tugas Selesai</p>
                        <h3 className="text-3xl font-black text-slate-800">{stats.done}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Assignments */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800">Tugas Terdekat</h2>
                        <Link href="/student/assignments" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                            Lihat Semua <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {upcomingAssignments.length > 0 ? (
                            upcomingAssignments.map((assignment) => {
                                const isDraft = assignment.submissions[0]?.status === 'DRAFT';
                                return (
                                    <Link
                                        key={assignment.id}
                                        href={`/student/assignments/${assignment.id}`}
                                        className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-primary/30 transition-all group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${isDraft ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{assignment.title}</h4>
                                                <p className="text-xs font-medium text-slate-400">{assignment.subject} • Tenggat: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        {isDraft && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-tighter">Draft</span>
                                        )}
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center gap-3">
                                <div className="text-slate-300"><CheckCircle size={40} /></div>
                                <p className="text-slate-400 font-bold">Yeay! Tidak ada tugas terdekat.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-black text-slate-800">Quick Menu</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Link href="/student/courses" className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-4 group">
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-500">
                                <BookOpen size={20} />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-primary">Materi Belajar</span>
                        </Link>
                        <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                <Clock size={120} />
                            </div>
                            <h4 className="font-black text-lg mb-2">Ingat!</h4>
                            <p className="text-blue-100 text-xs font-medium leading-relaxed">
                                Pastikan selalu klik "Simpan Draf" setiap selesai mengetik jawaban agar tidak hilang.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
