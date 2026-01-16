'use client';

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, Calendar, ChevronRight, Filter, X, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteButton } from "./DeleteButton";
import { deleteMaterial } from "@/actions/materials";

interface Material {
    id: string;
    title: string;
    description: string | null;
    courseId: string;
    createdAt: Date;
    course: {
        class: { name: string };
        subject: { name: string };
    };
    contents: any[];
}

interface MaterialsListClientProps {
    initialMaterials: any[];
}

export function MaterialsListClient({ initialMaterials }: MaterialsListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const classes = useMemo(() => {
        const uniqueClasses = new Set(initialMaterials.map(m => m.course.class.name));
        return Array.from(uniqueClasses).sort();
    }, [initialMaterials]);

    const subjects = useMemo(() => {
        const uniqueSubjects = new Set(initialMaterials.map(m => m.course.subject.name));
        return Array.from(uniqueSubjects).sort();
    }, [initialMaterials]);

    const filteredMaterials = useMemo(() => {
        return initialMaterials.filter(material => {
            const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesClass = !selectedClass || material.course.class.name === selectedClass;
            const matchesSubject = !selectedSubject || material.course.subject.name === selectedSubject;

            return matchesSearch && matchesClass && matchesSubject;
        });
    }, [initialMaterials, searchQuery, selectedClass, selectedSubject]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedClass(null);
        setSelectedSubject(null);
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari judul atau deskripsi materi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-slate-700 dark:text-slate-200"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Class Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                            <GraduationCap size={14} /> Kelas:
                        </span>
                        {classes.map(cls => (
                            <button
                                key={cls}
                                onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedClass === cls
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 self-center hidden md:block" />

                    {/* Subject Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
                            <BookOpen size={14} /> Mapel:
                        </span>
                        {subjects.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setSelectedSubject(selectedSubject === sub ? null : sub)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSubject === sub
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>

                    {(searchQuery || selectedClass || selectedSubject) && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors"
                        >
                            <X size={14} /> Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Materials Count */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Menampilkan <span className="text-primary">{filteredMaterials.length}</span> materi
                </p>
            </div>

            {/* Materials List */}
            <div className="grid gap-4">
                {filteredMaterials.map((material) => (
                    <div key={material.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    {material.course.class.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                    {material.course.subject.name}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{material.title}</h3>
                            <div className="flex items-center gap-4 mt-3 text-slate-400 dark:text-slate-500 text-xs font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Dibuat: {format(new Date(material.createdAt), 'dd MMM yyyy')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-1">
                                <EditMaterialModal material={material} />
                                <DeleteButton
                                    id={material.id}
                                    courseId={material.courseId}
                                    onDelete={deleteMaterial}
                                />
                            </div>
                            <Link
                                href={`/teacher/courses/${material.courseId}?tab=materials`}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                            >
                                Lihat di Kelas
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredMaterials.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                        {initialMaterials.length === 0
                            ? "Belum ada materi yang dibuat. Klik tombol di atas untuk membagikan materi pertama Anda."
                            : "Tidak ada materi yang sesuai dengan pencarian/filter Anda."}
                    </div>
                )}
            </div>
        </div>
    );
}
