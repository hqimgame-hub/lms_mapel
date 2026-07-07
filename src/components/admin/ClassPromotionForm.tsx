'use client';

import { useState, useTransition, useEffect } from "react";
import { promoteStudentsBulk } from "@/actions/users";
import { ArrowRight, GraduationCap, CheckSquare, Square, Users, AlertCircle, Sparkles } from "lucide-react";

interface ClassItem {
    id: string;
    name: string;
}

interface StudentItem {
    id: string;
    name: string;
    username: string;
    email: string | null;
}

interface ClassPromotionFormProps {
    classes: ClassItem[];
    students: StudentItem[];
    initialClassFromId: string;
}

export function ClassPromotionForm({ classes, students, initialClassFromId }: ClassPromotionFormProps) {
    const [classFromId, setClassFromId] = useState(initialClassFromId);
    const [targetClassId, setTargetClassId] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Reset selected student IDs when student list changes
    useEffect(() => {
        setSelectedStudentIds(students.map(s => s.id));
    }, [students]);

    const handleClassFromChange = (id: string) => {
        setClassFromId(id);
        const url = new URL(window.location.href);
        if (id) {
            url.searchParams.set('classFromId', id);
        } else {
            url.searchParams.delete('classFromId');
        }
        url.searchParams.set('page', '1'); // Reset pagination if any
        window.location.href = url.toString();
    };

    const toggleSelectAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s.id));
        }
    };

    const toggleSelectStudent = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handlePromoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentIds.length === 0) {
            alert("Pilih minimal satu siswa untuk dipindahkan.");
            return;
        }
        if (!targetClassId) {
            alert("Pilih kelas tujuan terlebih dahulu.");
            return;
        }
        setIsConfirmOpen(true);
    };

    const executePromotion = () => {
        setIsConfirmOpen(false);
        const targetId = targetClassId === "LULUS" ? null : targetClassId;

        startTransition(async () => {
            const result = await promoteStudentsBulk(selectedStudentIds, targetId);
            if (result.success) {
                alert(result.message);
                // Clear state
                setSelectedStudentIds([]);
                setTargetClassId("");
                // Refresh data by reloading page
                const url = new URL(window.location.href);
                window.location.href = url.toString();
            } else {
                alert(result.message);
            }
        });
    };

    const classFrom = classes.find(c => c.id === classFromId);
    const classToName = targetClassId === "LULUS" ? "Lulus / Alumni" : classes.find(c => c.id === targetClassId)?.name || "";

    return (
        <div className="flex flex-col gap-8">
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent p-6 rounded-[2rem] border border-primary/10 dark:border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Sparkles size={20} className="text-primary animate-pulse" />
                        Alur Kenaikan Kelas Tahun Ajaran Baru
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Pilih kelas asal dan kelas tujuan untuk memindahkan murid. Akun murid dan file tugas mereka tidak akan terhapus, sistem hanya memperbarui keanggotaan kelas mereka.
                    </p>
                </div>
            </div>

            <form onSubmit={handlePromoteSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* KOLOM KIRI: PILIH KELAS ASAL & TUJUAN */}
                <div className="lg:col-span-1 flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Parameter Kelas</h3>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Kelas Asal (Sumber Murid):</label>
                        <select
                            value={classFromId}
                            onChange={(e) => handleClassFromChange(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold dark:text-white"
                            required
                        >
                            <option value="">-- Pilih Kelas Asal --</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center my-2 text-slate-300 dark:text-slate-700">
                        <ArrowRight size={24} className="rotate-90 lg:rotate-0" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Kelas Tujuan (Promosi Ke):</label>
                        <select
                            value={targetClassId}
                            onChange={(e) => setTargetClassId(e.target.value)}
                            disabled={!classFromId}
                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-bold dark:text-white disabled:opacity-50"
                            required
                        >
                            <option value="">-- Pilih Kelas Tujuan --</option>
                            <option value="LULUS" className="text-purple-600 font-bold">🎓 Lulus / Alumni (Kosongkan Kelas)</option>
                            {classes
                                .filter(c => c.id !== classFromId) // Hindari mempromosikan ke kelas yang sama
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={!classFromId || !targetClassId || selectedStudentIds.length === 0 || isPending}
                        className="w-full mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
                    >
                        Proses Kenaikan Kelas
                    </button>
                </div>

                {/* KOLOM KANAN: DAFTAR SISWA KELAS ASAL */}
                <div className="lg:col-span-2 flex flex-col gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors min-h-[400px]">
                    <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users size={16} />
                            Daftar Siswa ({students.length} orang)
                        </h3>

                        {students.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {selectedStudentIds.length === students.length ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                                {selectedStudentIds.length} Terpilih
                            </button>
                        )}
                    </div>

                    {!classFromId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 gap-3">
                            <AlertCircle size={36} className="text-slate-300 dark:text-slate-700" />
                            <p className="font-bold text-sm">Pilih Kelas Asal terlebih dahulu untuk melihat daftar siswa.</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 gap-3">
                            <Users size={36} className="text-slate-300 dark:text-slate-700" />
                            <p className="font-bold text-sm">Tidak ada siswa yang terdaftar di kelas ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50 dark:border-slate-800">
                                        <th className="pb-3 w-12"></th>
                                        <th className="pb-3 font-black text-[10px] uppercase tracking-widest text-slate-400">Nama Siswa</th>
                                        <th className="pb-3 font-black text-[10px] uppercase tracking-widest text-slate-400">Username</th>
                                        <th className="pb-3 font-black text-[10px] uppercase tracking-widest text-slate-400">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {students.map(student => (
                                        <tr 
                                            key={student.id} 
                                            className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                            onClick={() => toggleSelectStudent(student.id)}
                                        >
                                            <td className="py-4">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleSelectStudent(student.id); }}>
                                                    {selectedStudentIds.includes(student.id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-slate-200 dark:text-slate-700" />}
                                                </button>
                                            </td>
                                            <td className="py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">{student.name}</td>
                                            <td className="py-4 text-xs font-mono text-slate-400">{student.username}</td>
                                            <td className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{student.email || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </form>

            {/* CONFIRMATION MODAL */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                {targetClassId === "LULUS" ? (
                                    <>
                                        <GraduationCap className="text-purple-500" size={24} />
                                        Konfirmasi Kelulusan
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="text-primary" size={24} />
                                        Konfirmasi Kenaikan Kelas
                                    </>
                                )}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Apakah Anda yakin ingin memproses tindakan berikut?
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400">Siswa Terpilih:</span>
                                <span className="text-sm font-black text-slate-800 dark:text-white">{selectedStudentIds.length} Siswa</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400">Dari Kelas:</span>
                                <span className="text-sm font-black text-primary">{classFrom?.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                                <span className="text-xs font-medium text-slate-400">Dipindahkan ke:</span>
                                <span className={`text-sm font-black ${targetClassId === "LULUS" ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {classToName}
                                </span>
                            </div>
                        </div>

                        {targetClassId === "LULUS" ? (
                            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 p-4 rounded-2xl text-xs text-purple-600 dark:text-purple-400 font-semibold leading-relaxed">
                                Keanggotaan kelas saat ini akan dikosongkan. Akun siswa tetap ada di database dan mereka dapat didaftarkan kembali ke kelas lainnya nanti.
                            </div>
                        ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
                                Seluruh siswa terpilih akan dipindahkan ke kelas {classToName}. Riwayat tugas dan nilai lama tetap terarsip aman di database.
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={executePromotion}
                                disabled={isPending}
                                className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-md ${
                                    targetClassId === "LULUS"
                                        ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/10"
                                        : "bg-primary hover:bg-primary/90 shadow-primary/10"
                                }`}
                            >
                                Ya, Proses
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
