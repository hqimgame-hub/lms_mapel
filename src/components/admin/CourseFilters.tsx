'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface CourseFiltersProps {
    classes: { id: string; name: string }[];
    subjects: { id: string; name: string }[];
    teachers: { id: string; name: string }[];
}

export function CourseFilters({ classes, subjects, teachers }: CourseFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/admin/courses?${params.toString()}`);
    };

    const hasFilters = searchParams.get('classId') || searchParams.get('subjectId') || searchParams.get('teacherId');

    const clearFilters = () => {
        router.push('/admin/courses');
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
                <Filter size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                <select
                    value={searchParams.get('classId') || ''}
                    onChange={(e) => updateFilter('classId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                    <option value="">Semua Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                    value={searchParams.get('subjectId') || ''}
                    onChange={(e) => updateFilter('subjectId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                    <option value="">Semua Mata Pelajaran</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                    value={searchParams.get('teacherId') || ''}
                    onChange={(e) => updateFilter('teacherId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                    <option value="">Semua Guru</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all whitespace-nowrap"
                >
                    <X size={14} />
                    Reset
                </button>
            )}
        </div>
    );
}
