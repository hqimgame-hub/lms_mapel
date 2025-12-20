import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    Users,
    UserCheck,
    School,
    BookMarked,
    PlusCircle,
    UserPlus,
    Layers,
    BookPlus,
    Activity,
    ArrowRight,
    UserCircle,
    ClipboardList
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) return redirect('/login');

    if (session.user.role === 'ADMIN') redirect('/admin/users'); // Or a specific admin dash if created
    if (session.user.role === 'TEACHER') redirect('/teacher/assignments'); // Or teacher home
    if (session.user.role === 'STUDENT') redirect('/student');

    // ... rest of the code is technically unreachable now but I'll keep it or move it if needed
    // Actually, I should probably move the logic to the respective pages instead of redirecting if I want to keep the UI.
    // But since I already created /student, redirecting is cleaner.

    // Fetch teaching courses (if teacher)
    const teacherCourses = session.user.role === 'TEACHER'
        ? await prisma.course.findMany({
            where: { teacherId: session.user.id },
            include: {
                class: true,
                subject: true,
                assignments: {
                    select: {
                        _count: {
                            select: {
                                submissions: {
                                    where: { status: 'SUBMITTED' }
                                }
                            }
                        }
                    }
                },
                _count: { select: { assignments: true } }
            }
        })
        : [];

    // Calculate total pending submissions for teacher
    const totalPending = teacherCourses.reduce((acc, course) => {
        return acc + course.assignments.reduce((sum, assign) => sum + assign._count.submissions, 0);
    }, 0);

    // Admin Stats & Recent Data
    let adminData = null;
    if (session.user.role === 'ADMIN') {
        const [totalStudents, totalTeachers, totalClasses, totalSubjects, recentUsers] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER' } }),
            prisma.class.count(),
            prisma.subject.count(),
            prisma.user.findMany({
                orderBy: { id: 'desc' },
                take: 5
            })
        ]);
        adminData = { totalStudents, totalTeachers, totalClasses, totalSubjects, recentUsers };
    }

    const isStudent = session.user.role === 'STUDENT';
    const isTeacher = session.user.role === 'TEACHER';
    const isAdmin = session.user.role === 'ADMIN';

    // Flatten courses from all enrolled classes (Student)
    const myCourses = user?.enrollments.flatMap(e => e.class.courses) || [];

    async function joinClass(formData: FormData) {
        'use server';
        const code = formData.get('code') as string;
        const userId = session?.user?.id;
        if (!userId || !code) return;

        try {
            const classToJoin = await prisma.class.findUnique({ where: { code } });
            if (!classToJoin) {
                console.error("Invalid class code");
                return;
            }

            const existing = await prisma.enrollment.findUnique({
                where: {
                    userId_classId: { userId, classId: classToJoin.id }
                }
            });

            if (existing) return;

            await prisma.enrollment.create({
                data: {
                    userId,
                    classId: classToJoin.id
                }
            });
            revalidatePath('/dashboard');
        } catch (e) {
            console.error('Failed to join class', e);
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 font-medium">Selamat datang kembali, <span className="text-primary font-bold">{session?.user?.name}</span></p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border shadow-sm w-fit">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sesi: {session?.user?.role}</span>
                </div>
            </header>

            {isAdmin && adminData && (
                <div className="space-y-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <Activity size={16} className="text-slate-200" />
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Siswa</div>
                            <div className="text-3xl font-black text-slate-800">{adminData.totalStudents}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                    <UserCheck size={24} />
                                </div>
                                <Activity size={16} className="text-slate-200" />
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Guru</div>
                            <div className="text-3xl font-black text-slate-800">{adminData.totalTeachers}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-violet-50 p-3 rounded-2xl text-violet-600 group-hover:scale-110 transition-transform">
                                    <School size={24} />
                                </div>
                                <Activity size={16} className="text-slate-200" />
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Kelas</div>
                            <div className="text-3xl font-black text-slate-800">{adminData.totalClasses}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                                    <BookMarked size={24} />
                                </div>
                                <Activity size={16} className="text-slate-200" />
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Mapel</div>
                            <div className="text-3xl font-black text-slate-800">{adminData.totalSubjects}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <PlusCircle size={20} className="text-primary" />
                                    Aksi Cepat Manajemen
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/admin/users" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                <UserPlus size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm">Kelola Pengguna</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                    <Link href="/admin/classes" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Layers size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm">Kelola Kelas</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                    <Link href="/admin/subjects" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                <BookPlus size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm">Kelola Mapel</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                    <Link href="/admin/courses" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2.5 rounded-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Layers size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm">Alokasi Kursus</span>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity (Placeholder/Simulated) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-primary" />
                                Pengguna Terbaru
                            </h3>
                            <div className="space-y-4">
                                {adminData.recentUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs uppercase">
                                                {u.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 leading-none mb-1">{u.name}</p>
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                    {u.role.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isStudent && (
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-primary to-blue-700 p-8 rounded-[2rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden">
                        <div className="relative z-10 max-w-lg">
                            <h3 className="text-2xl font-black mb-3">Gabung Kelas Bareng Teman!</h3>
                            <p className="text-blue-100 text-sm mb-6 leading-relaxed">Punya kode kelas dari guru? Masukkan kodenya di sini untuk langsung masuk ke ruang belajar virtual Anda.</p>
                            <form action={joinClass} className="flex gap-2 max-w-sm">
                                <input
                                    name="code"
                                    placeholder="KODE KELAS (MIS: X7K9L)"
                                    className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-2xl placeholder:text-blue-200 outline-none focus:bg-white focus:text-slate-900 transition-all font-mono font-bold uppercase"
                                    required
                                />
                                <button className="bg-white text-primary px-6 py-3 rounded-2xl hover:bg-blue-50 transition-all font-bold shadow-lg">
                                    Gabung
                                </button>
                            </form>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                            <School size={200} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Kelas Saya
                        </h3>
                        {myCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCourses.map(course => (
                                    <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                                        <div className="relative z-10">
                                            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                                {course.class.name}
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-800 mb-2 truncate">{course.subject.name}</h4>
                                            <div className="flex items-center gap-2 text-slate-400 mb-6">
                                                <UserCircle size={14} />
                                                <span className="text-xs font-medium">{course.teacher.name}</span>
                                            </div>
                                            <Link href={`/student/courses/${course.id}`} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm group-hover:bg-primary transition-colors">
                                                Masuk Kelas
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center px-6">
                                <div className="bg-slate-50 p-6 rounded-full text-slate-300 mb-4">
                                    <BookMarked size={48} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Kelas Terdaftar</h4>
                                <p className="text-slate-400 text-sm max-w-xs">Mulai dengan memasukkan kode kelas yang Anda terima dari guru pengajar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isTeacher && (
                <div className="space-y-8">
                    {/* Teacher Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                                    <School size={24} />
                                </div>
                                <Activity size={16} className="text-slate-200" />
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Kelas</div>
                            <div className="text-3xl font-black text-slate-800">{teacherCourses.length}</div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <ClipboardList size={24} />
                                </div>
                                {totalPending > 0 && <div className="bg-red-500 w-2.5 h-2.5 rounded-full animate-ping" />}
                            </div>
                            <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Perlu Dinilai</div>
                            <div className="text-3xl font-black text-slate-800 flex items-baseline gap-2">
                                {totalPending}
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Pengumpulan</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl border border-slate-700 shadow-lg text-white group relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Aksi Cepat</h4>
                                <div className="flex gap-2">
                                    <Link href="/teacher/assignments" className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-xl text-center text-xs font-bold transition-all border border-white/5 backdrop-blur-sm">
                                        Riwayat Tugas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                            Kelas yang Diajar
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teacherCourses.map(course => (
                            <div key={course.id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-emerald-500">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                        {course.class.name}
                                    </div>
                                    <div className="text-slate-300">
                                        <Layers size={20} />
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">{course.subject.name}</h4>
                                <div className="flex items-center gap-2 text-slate-400 mb-8 text-sm">
                                    <Activity size={16} />
                                    <span>{course._count.assignments} Tugas Aktif</span>
                                </div>
                                <Link href={`/teacher/courses/${course.id}`} className="flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                    Detail & Kelola
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                        {teacherCourses.length === 0 && (
                            <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center px-6">
                                <div className="bg-slate-50 p-6 rounded-full text-slate-300 mb-4">
                                    <UserCheck size={48} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Belum Ditugaskan</h4>
                                <p className="text-slate-400 text-sm max-w-xs">Anda belum ditugaskan untuk mengajar di kelas manapun. Hubungi Admin untuk alokasi kursus.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
