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

    // Extract current filter values for controlled components
    const currentClassId = searchParams.get('classId') || '';
    const currentSubjectId = searchParams.get('subjectId') || '';
    const currentTeacherId = searchParams.get('teacherId') || '';

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center gap-2 text-primary dark:text-primary-400 mr-2">
                <Filter size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Filter:</span>
            </div>

            <select
                onChange={(e) => updateFilter('classId', e.target.value)}
                value={currentClassId}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
                <option value="">Semua Kelas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
                onChange={(e) => updateFilter('subjectId', e.target.value)}
                value={currentSubjectId}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
                <option value="">Semua Mata Pelajaran</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select
                onChange={(e) => updateFilter('teacherId', e.target.value)}
                value={currentTeacherId}
                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
                <option value="">Semua Guru</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    <X size={14} />
                    Reset
                </button>
            )}
        </div>
    );
}
