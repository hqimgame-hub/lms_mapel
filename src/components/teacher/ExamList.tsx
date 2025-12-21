import { ClipboardList, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { EditExamModal } from "./EditExamModal";
import { DeleteButton } from "./DeleteButton";
import { deleteExam } from "@/actions/exams";

interface Exam {
    id: string;
    title: string;
    description: string | null;
    type: string;
    link: string | null;
    dueDate: Date | null;
    startTime: Date | null;
    endTime: Date | null;
    duration: number | null;
    courseId: string;
    createdAt: Date;
}

interface ExamListProps {
    exams: Exam[];
    courseId: string;
    isTeacher?: boolean;
}

export function ExamList({ exams, courseId, isTeacher = false }: ExamListProps) {
    return (
        <div className="grid gap-4">
            {exams.map((exam) => (
                <div key={exam.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col md:flex-row justify-between gap-6 group">
                    <div className="flex gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl h-fit group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                            <ClipboardList className="text-emerald-500 dark:text-emerald-400" size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{exam.title}</h3>
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                    {exam.type}
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 font-medium">{exam.description || 'Tidak ada deskripsi'}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <Calendar size={14} />
                                    Batas: {exam.dueDate ? format(new Date(exam.dueDate), 'PPP') : 'Tanpa Batas'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isTeacher && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditExamModal exam={exam} />
                                <DeleteButton
                                    id={exam.id}
                                    courseId={courseId}
                                    onDelete={deleteExam}
                                />
                            </div>
                        )}
                        {exam.link && (
                            (() => {
                                const now = new Date();
                                const start = exam.startTime ? new Date(exam.startTime) : null;
                                const end = exam.endTime ? new Date(exam.endTime) : null;

                                const isBeforeStart = start && now < start;
                                const isAfterEnd = end && now > end;
                                const isLocked = isBeforeStart || isAfterEnd;

                                return (
                                    <div className="flex flex-col items-end gap-1">
                                        <a
                                            href={isLocked ? '#' : exam.link}
                                            target={isLocked ? undefined : "_blank"}
                                            rel="noopener noreferrer"
                                            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isLocked
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                                }`}
                                            onClick={(e) => isLocked && e.preventDefault()}
                                        >
                                            {isBeforeStart ? 'Belum Mulai' : isAfterEnd ? 'Selesai' : 'Mulai Ujian'}
                                            {!isLocked && <ExternalLink size={18} />}
                                        </a>
                                        {isLocked && (
                                            <span className="text-[10px] uppercase font-black tracking-widest text-red-400 dark:text-red-500/80">
                                                {isBeforeStart
                                                    ? `Dibuka: ${start ? format(start, 'd MMM HH:mm') : '-'}`
                                                    : `Ditutup: ${end ? format(end, 'd MMM HH:mm') : '-'}`
                                                }
                                            </span>
                                        )}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            ))}

            {exams.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                        <ClipboardList size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Belum Ada Ujian</h4>
                    <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">Buat link ujian Google Form atau instruksi ujian lainnya untuk siswa.</p>
                </div>
            )}
        </div>
    );
}
