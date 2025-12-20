import { auth, signOut } from '@/auth';
import { NavItem } from './NavItem';
import { BookOpen, LayoutDashboard, Layers, Users, Home, PlusCircle } from 'lucide-react';

export async function Sidebar() {
    const session = await auth();
    const role = session?.user?.role;

    return (
        <div className="w-64 h-full bg-slate-100 border-r p-4 flex-col hidden md:flex">
            <div className="text-xl font-bold mb-6 text-primary px-2 italic tracking-tight">LMS Sekolah</div>

            <nav className="flex flex-col gap-1">
                <NavItem href="/dashboard" icon={<Home size={20} />} label="Beranda" />

                {role === 'ADMIN' && (
                    <>
                        <div className="text-[10px] font-bold text-gray-400 mt-6 px-2 mb-1 uppercase tracking-widest">Manajemen Web</div>
                        <div className="flex flex-col gap-1 text-slate-700">
                            <NavItem href="/admin/users" icon={<Users size={18} />} label="Pengguna" />
                            <NavItem href="/admin/classes" icon={<LayoutDashboard size={18} />} label="Kelas" />
                            <NavItem href="/admin/subjects" icon={<BookOpen size={18} />} label="Mapel" />
                            <NavItem href="/admin/courses" icon={<Layers size={18} />} label="Alokasi Kursus" />
                        </div>
                    </>
                )}

                {role === 'TEACHER' && (
                    <>
                        <div className="text-[10px] font-bold text-gray-400 mt-6 px-2 mb-1 uppercase tracking-widest">Kurikulum</div>
                        <div className="flex flex-col gap-1 text-slate-700">
                            <NavItem href="/teacher/assignments" icon={<Layers size={18} />} label="Tugas" />
                            <NavItem href="/teacher/materials" icon={<BookOpen size={18} />} label="Materi" />
                            <NavItem href="/teacher/exams" icon={<PlusCircle size={18} />} label="Ujian" />
                        </div>

                        <div className="text-[10px] font-bold text-gray-400 mt-6 px-2 mb-1 uppercase tracking-widest">Manajemen Nilai</div>
                        <div className="flex flex-col gap-1 text-slate-700">
                            <NavItem href="/teacher/grading" icon={<Users size={18} />} label="Penilaian" />
                            <NavItem href="/teacher/recap" icon={<LayoutDashboard size={18} />} label="Rekap Nilai" />
                        </div>
                    </>
                )}

                {role === 'STUDENT' && (
                    <>
                        <div className="text-[10px] font-bold text-gray-400 mt-6 px-2 mb-1 uppercase tracking-widest">Belajar</div>
                        <div className="flex flex-col gap-1 text-slate-700">
                            <NavItem href="/student/assignments" icon={<Layers size={18} />} label="Tugas Saya" />
                            <NavItem href="/student/courses" icon={<BookOpen size={18} />} label="Materi & Kursus" />
                        </div>
                    </>
                )}
            </nav>

            <div className="mt-auto pt-6 border-t bg-slate-50 mb-0">
                <div className="px-2">
                    <div className="text-sm font-medium truncate">{session?.user?.name || session?.user?.email}</div>
                    <div className="text-xs text-gray-500 capitalize mb-3">{role?.toLowerCase()}</div>

                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/login' });
                        }}
                    >
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-md text-sm font-medium transition-colors">
                            <span>Keluar</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
