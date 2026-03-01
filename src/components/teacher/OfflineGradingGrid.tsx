'use client';

import { useState, useTransition } from "react";
import { saveOfflineGrades } from "@/actions/offline-grades";

interface Student {
    id: string;
    name: string;
    username: string;
}

interface Submission {
    studentId: string;
    grade: number | null;
    feedback: string | null;
}

interface OfflineGradingGridProps {
    assignmentId: string;
    students: Student[];
    initialSubmissions: Submission[];
}

export function OfflineGradingGrid({ assignmentId, students, initialSubmissions }: OfflineGradingGridProps) {
    const [grades, setGrades] = useState<Record<string, { grade: number | null, feedback: string }>>(() => {
        const initialMap: Record<string, { grade: number | null, feedback: string }> = {};
        students.forEach(student => {
            const sub = initialSubmissions.find(s => s.studentId === student.id);
            initialMap[student.id] = {
                grade: sub?.grade ?? null,
                feedback: sub?.feedback ?? ''
            };
        });
        return initialMap;
    });

    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleGradeChange = (studentId: string, value: string) => {
        const val = value === '' ? null : Number(value);
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], grade: val }
        }));
    };

    const handleFeedbackChange = (studentId: string, value: string) => {
        setGrades(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], feedback: value }
        }));
    };

    const handleSaveAll = () => {
        startTransition(async () => {
            setMessage(null);
            const gradesToSave = Object.entries(grades).map(([studentId, data]) => ({
                studentId,
                grade: data.grade,
                feedback: data.feedback
            }));

            const result = await saveOfflineGrades(assignmentId, gradesToSave);

            setMessage({
                text: result.message,
                type: result.success ? 'success' : 'error'
            });

            if (result.success) {
                setTimeout(() => setMessage(null), 3000);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all mt-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">Penilaian Langsung</h2>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Isi nilai dan catatan secara langsung, lalu klik Simpan Semua</p>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                </button>
            </div>

            {message && (
                <div className={`p-4 text-center font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-1/3">Siswa</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest w-24 text-center">Nilai (0-100)</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catatan (Opsional)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                <td className="p-4 md:p-6">
                                    <div className="font-black text-slate-800 dark:text-slate-200">{student.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{student.username}</div>
                                </td>
                                <td className="p-4 md:p-6 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grades[student.id]?.grade ?? ''}
                                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                        className="w-16 md:w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-sm font-bold text-slate-800 dark:text-slate-200 mx-auto block"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="p-4 md:p-6">
                                    <input
                                        type="text"
                                        value={grades[student.id]?.feedback ?? ''}
                                        onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm  text-slate-800 dark:text-slate-200"
                                        placeholder="Catatan untuk siswa..."
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
