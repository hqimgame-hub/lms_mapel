import { FileText, Youtube, Link as LinkIcon, File, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteButton } from "./DeleteButton";
import { deleteMaterial } from "@/actions/materials";

interface MaterialContent {
    id: string;
    type: string;
    content: string;
    order: number;
}

interface Material {
    id: string;
    title: string;
    description: string | null;
    courseId: string;
    courseId: string;
    published: boolean;
    createdAt: Date;
    contents: MaterialContent[];
}

interface MaterialListProps {
    materials: Material[];
    courseId: string;
    isTeacher?: boolean;
}

export function MaterialList({ materials, courseId, isTeacher = false }: MaterialListProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'YOUTUBE_LINK':
                return <Youtube className="text-red-500" size={20} />;
            case 'PDF_LINK':
                return <FileText className="text-orange-500" size={20} />;
            case 'EXTERNAL_LINK':
                return <LinkIcon className="text-blue-500" size={20} />;
            default:
                return <File className="text-gray-500" size={20} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'YOUTUBE_LINK':
                return '🎬 Video YouTube';
            case 'PDF_LINK':
                return '📄 PDF/Dokumen';
            case 'EXTERNAL_LINK':
                return '🔗 Link Eksternal';
            default:
                return '📝 Teks';
        }
    };

    return (
        <div className="grid gap-4">
            {materials.map((material) => {
                const sortedContents = [...material.contents].sort((a, b) => a.order - b.order);

                return (
                    <div key={material.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{material.title}</h3>

                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                                    {material.description || 'Tidak ada deskripsi'}
                                </p>
                            </div>
                            {isTeacher && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                    <EditMaterialModal material={material} />
                                    <DeleteButton
                                        id={material.id}
                                        courseId={courseId}
                                        onDelete={deleteMaterial}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Content Items */}
                        <div className="space-y-3 mt-4">
                            {sortedContents.map((contentItem, idx) => (
                                <div key={contentItem.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getIcon(contentItem.type)}
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            {getTypeLabel(contentItem.type)}
                                        </span>
                                    </div>

                                    {contentItem.type === 'TEXT' ? (
                                        <div className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                            {contentItem.content}
                                        </div>
                                    ) : (
                                        <a
                                            href={contentItem.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-primary dark:text-blue-400 hover:text-white dark:hover:text-white hover:bg-primary dark:hover:bg-blue-600 px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2 border border-primary/10 dark:border-blue-400/20 uppercase tracking-widest"
                                        >
                                            Buka Resource
                                            <LinkIcon size={12} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                                {format(new Date(material.createdAt), 'dd MMM yyyy')}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-600 font-black uppercase tracking-wider">
                                {sortedContents.length} Konten
                            </span>
                        </div>
                    </div>
                );
            })}

            {materials.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 transition-colors">
                    Belum ada materi dibagikan.
                </div>
            )}
        </div>
    );
}
