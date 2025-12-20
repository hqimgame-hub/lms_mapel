'use client';

import { Menu, X, Home, BookOpen, LayoutDashboard, Layers, Users, GraduationCap, ClipboardList } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NavItem } from "./NavItem";

interface MobileNavProps {
    role?: string;
}

export function MobileNav({ role }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
            )}

            {/* Drawer */}
            <div className={clsx(
                "fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl transition-transform duration-300 ease-in-out transform p-4 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-bold text-primary italic">LMS Sekolah</div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex flex-col gap-2">
                    <NavItem href="/dashboard" icon={<Home size={20} />} label="Beranda" onClick={() => setIsOpen(false)} />

                    {role === 'ADMIN' && (
                        <>
                            <div className="text-[10px] font-bold text-gray-400 mt-4 mb-2 uppercase tracking-widest px-2">Admin</div>
                            <div className="flex flex-col gap-1">
                                <NavItem href="/admin/users" icon={<Users size={20} />} label="Pengguna" onClick={() => setIsOpen(false)} />
                                <NavItem href="/admin/classes" icon={<LayoutDashboard size={20} />} label="Kelas" onClick={() => setIsOpen(false)} />
                                <NavItem href="/admin/subjects" icon={<BookOpen size={20} />} label="Mapel" onClick={() => setIsOpen(false)} />
                                <NavItem href="/admin/courses" icon={<Layers size={20} />} label="Alokasi Kursus" onClick={() => setIsOpen(false)} />
                            </div>
                        </>
                    )}

                    {role === 'TEACHER' && (
                        <>
                            <div className="text-[10px] font-bold text-gray-400 mt-4 mb-2 uppercase tracking-widest px-2">Guru</div>
                            <NavItem href="/dashboard" icon={<ClipboardList size={20} />} label="Tugas Siswa" onClick={() => setIsOpen(false)} />
                        </>
                    )}

                    {role === 'STUDENT' && (
                        <>
                            <div className="text-[10px] font-bold text-gray-400 mt-4 mb-2 uppercase tracking-widest px-2">Siswa</div>
                            <NavItem href="/dashboard" icon={<GraduationCap size={20} />} label="Kursus Saya" onClick={() => setIsOpen(false)} />
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
}
