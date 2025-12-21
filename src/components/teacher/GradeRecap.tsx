'use client';

import { useState } from "react";
import { Download, ChevronDown, Trophy, Users, AlertCircle } from "lucide-react";

interface GradeRecapProps {
    courses: {
        id: string;
        subject: { name: string };
        class: {
            name: string;
            students: {
                user: { id: string; name: string };
            }[];
        };
        assignments: {
            id: string;
            title: string;
            submissions: {
                studentId: string;
                grade: number | null;
            }[];
        }[];
    }[];
}

export function GradeRecap({ courses }: GradeRecapProps) {
    const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    if (!selectedCourse) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-colors">
                <p className="text-slate-400 font-bold">Tidak ada data kelas yang tersedia.</p>
            </div>
        );
    }

    const downloadCSV = () => {
        if (!selectedCourse) return;

        const headers = ['Nama Siswa', ...selectedCourse.assignments.map(a => a.title), 'Rata-rata'];
        const rows = selectedCourse.class.students.map(enrollment => {
            const studentId = enrollment.user.id;
            const grades = selectedCourse.assignments.map(a => {
                const sub = a.submissions.find(s => s.studentId === studentId);
                return sub?.grade ?? 0;
            });
            const validGrades = grades.filter(g => g > 0);
            const average = validGrades.length > 0
                ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)
                : '0';

            return [`"${enrollment.user.name}"`, ...grades, average];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Rekap_Nilai_${selectedCourse.class.name}_${selectedCourse.subject.name}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="relative">
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-slate-800 border-none pl-6 pr-12 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.class.name} - {course.subject.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Download size={18} />
                    Download CSV
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[10px] uppercase font-black tracking-widest text-slate-400">
                            <tr>
                                <th className="px-8 py-6 min-w-[200px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-100 dark:border-slate-700 transition-colors">Nama Siswa</th>
                                {selectedCourse.assignments.map(a => (
                                    <th key={a.id} className="px-6 py-6 min-w-[150px] whitespace-nowrap">
                                        {a.title}
                                    </th>
                                ))}
                                <th className="px-8 py-6 text-right min-w-[100px]">Rata-rata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {selectedCourse.class.students.map((enrollment) => {
                                const grades = selectedCourse.assignments.map(a => {
                                    const sub = a.submissions.find(s => s.studentId === enrollment.user.id);
                                    return sub?.grade;
                                });
                                const validGrades = grades.filter((g): g is number => typeof g === 'number');
                                const average = validGrades.length > 0
                                    ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
                                    : 0;

                                return (
                                    <tr key={enrollment.user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors font-medium text-slate-600 dark:text-slate-400">
                                        <td className="px-8 py-4 sticky left-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r border-slate-50 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                                            {enrollment.user.name}
                                        </td>
                                        {grades.map((grade, idx) => (
                                            <td key={idx} className="px-6 py-4">
                                                {grade !== undefined && grade !== null ? (
                                                    <span className={`px-2 py-1 rounded-lg font-bold text-xs ${grade >= 90 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                        grade >= 75 ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                            'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {grade}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-700">-</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-8 py-4 text-right">
                                            <span className="font-black text-slate-800 dark:text-slate-100">{average.toFixed(1)}</span>
                                        </td>
                                    </tr>
                                );
                            })}

                            {selectedCourse.class.students.length === 0 && (
                                <tr>
                                    <td colSpan={selectedCourse.assignments.length + 2} className="px-8 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={32} className="text-slate-200 dark:text-slate-800" />
                                            <p>Belum ada siswa di kelas ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legenda/Info */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-wider transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>Excellent (90-100)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Good (75-89)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Remedial (&lt;75)</span>
                </div>
            </div>
        </div>
    );
}
