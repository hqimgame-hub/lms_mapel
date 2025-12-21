import { auth, signOut } from '@/auth';
import { NavItem } from './NavItem';
import Image from 'next/image';
import { BookOpen, LayoutDashboard, Layers, Users, Home, PlusCircle } from 'lucide-react';

export async function Sidebar() {
    const session = await auth();
    const role = session?.user?.role;

    return (
        <div className="w-72 h-full bg-white dark:bg-slate-900 border-r dark:border-slate-800 p-6 flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
            <div className="flex flex-col mb-8">
                <div className="relative w-full h-10 flex items-center">
                    {/* Logo for Light Mode (Dark Logo) */}
                    <Image
                        src="/images/logo-light.png"
                        alt="LMS Logo"
                        width={110}
                        height={32}
                        className="dark:hidden object-contain"
                    />
                    {/* Logo for Dark Mode (White Logo) */}
                    <Image
                        src="/images/logo-dark.png"
                        alt="LMS Logo"
                        width={110}
                        height={32}
                        className="hidden dark:block object-contain"
                    />
                </div>
                <div className="text-[9px] font-black text-primary/40 dark:text-primary/30 uppercase tracking-[0.3em] mt-2 ml-0.5">Digital Learning Platform</div>
            </div>

            <nav className="flex flex-col gap-2">
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

            <div className="mt-auto pt-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mb-0 transition-colors">
                <div className="px-2">
                    <div className="text-sm font-medium truncate dark:text-slate-200">{session?.user?.name || session?.user?.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-3">{role?.toLowerCase()}</div>

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
