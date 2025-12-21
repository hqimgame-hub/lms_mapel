'use client';

import { Menu, X, Home, BookOpen, LayoutDashboard, Layers, Users, PlusCircle, LogOut } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NavItem } from "./NavItem";
import { signOut } from 'next-auth/react';

interface MobileNavProps {
    role?: string;
    userName?: string | null;
    userEmail?: string | null;
}

export function MobileNav({ role, userName, userEmail }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Open Menu"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={clsx(
                "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
                    <div className="flex flex-col">
                        <div className="relative h-8 w-8 flex items-center">
                            {/* Logo for Light Mode (Dark Logo) */}
                            <Image
                                src="/images/logo-light.png"
                                alt="LMS Logo"
                                width={32}
                                height={32}
                                className="dark:hidden object-contain"
                            />
                            {/* Logo for Dark Mode (White Logo) */}
                            <Image
                                src="/images/logo-dark.png"
                                alt="LMS Logo"
                                width={32}
                                height={32}
                                className="hidden dark:block object-contain"
                            />
                        </div>
                        <div className="text-[8px] font-black text-primary/40 dark:text-primary/30 uppercase tracking-[0.2em] mt-1 ml-0.5">Digital Learning Platform</div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <nav className="flex flex-col gap-1">
                        <NavItem href="/dashboard" icon={<Home size={20} />} label="Beranda" onClick={() => setIsOpen(false)} />

                        {role === 'ADMIN' && (
                            <>
                                <div className="text-[10px] font-bold text-slate-400 mt-6 px-3 mb-2 uppercase tracking-widest">Manajemen Web</div>
                                <div className="flex flex-col gap-1">
                                    <NavItem href="/admin/users" icon={<Users size={18} />} label="Pengguna" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/admin/classes" icon={<LayoutDashboard size={18} />} label="Kelas" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/admin/subjects" icon={<BookOpen size={18} />} label="Mapel" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/admin/courses" icon={<Layers size={18} />} label="Alokasi Kursus" onClick={() => setIsOpen(false)} />
                                </div>
                            </>
                        )}

                        {role === 'TEACHER' && (
                            <>
                                <div className="text-[10px] font-bold text-slate-400 mt-6 px-3 mb-2 uppercase tracking-widest">Kurikulum</div>
                                <div className="flex flex-col gap-1">
                                    <NavItem href="/teacher/assignments" icon={<Layers size={18} />} label="Tugas" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/teacher/materials" icon={<BookOpen size={18} />} label="Materi" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/teacher/exams" icon={<PlusCircle size={18} />} label="Ujian" onClick={() => setIsOpen(false)} />
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 mt-6 px-3 mb-2 uppercase tracking-widest">Manajemen Nilai</div>
                                <div className="flex flex-col gap-1">
                                    <NavItem href="/teacher/grading" icon={<Users size={18} />} label="Penilaian" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/teacher/recap" icon={<LayoutDashboard size={18} />} label="Rekap Nilai" onClick={() => setIsOpen(false)} />
                                </div>
                            </>
                        )}

                        {role === 'STUDENT' && (
                            <>
                                <div className="text-[10px] font-bold text-slate-400 mt-6 px-3 mb-2 uppercase tracking-widest">Belajar</div>
                                <div className="flex flex-col gap-1">
                                    <NavItem href="/student/assignments" icon={<Layers size={18} />} label="Tugas Saya" onClick={() => setIsOpen(false)} />
                                    <NavItem href="/student/courses" icon={<BookOpen size={18} />} label="Materi & Kursus" onClick={() => setIsOpen(false)} />
                                </div>
                            </>
                        )}
                    </nav>
                </div>

                {/* Footer with User Info & Logout */}
                <div className="mt-auto p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shadow-inner transition-colors">
                            {userName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <div className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{userName || 'User'}</div>
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">{role?.toLowerCase()}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                        <LogOut size={16} />
                        Keluar Aplikasi
                    </button>
                </div>
            </div>
        </div>
    );
}
