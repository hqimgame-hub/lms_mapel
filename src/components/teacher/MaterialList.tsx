import { FileText, Youtube, Link as LinkIcon, File, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteButton } from "./DeleteButton";
import { deleteMaterial } from "@/actions/materials";

interface Material {
    id: string;
    title: string;
    description: string | null;
    type: string;
    content: string;
    courseId: string;
    createdAt: Date;
}

interface MaterialListProps {
    materials: Material[];
    courseId: string;
}

export function MaterialList({ materials, courseId }: MaterialListProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'YOUTUBE_LINK':
                return <Youtube className="text-red-500" size={24} />;
            case 'PDF_LINK':
                return <FileText className="text-orange-500" size={24} />;
            case 'EXTERNAL_LINK':
                return <LinkIcon className="text-blue-500" size={24} />;
            default:
                return <File className="text-gray-500" size={24} />;
        }
    };

    const getClickableLink = (material: Material) => {
        if (material.type === 'TEXT') return null;
        return material.content;
    };

    return (
        <div className="grid gap-4">
            {materials.map((material) => {
                const link = getClickableLink(material);

                return (
                    <div key={material.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/30 hover:shadow-xl transition-all flex items-start gap-4 group">
                        <div className="bg-slate-50 p-4 rounded-2xl flex-shrink-0 group-hover:bg-primary/5 transition-colors">
                            {getIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 truncate text-lg">{material.title}</h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EditMaterialModal material={material} />
                                    <DeleteButton
                                        id={material.id}
                                        courseId={courseId}
                                        onDelete={deleteMaterial}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-4 font-medium">
                                {material.description || 'Tidak ada deskripsi'}
                            </p>

                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                                    {format(new Date(material.createdAt), 'dd MMM yyyy')}
                                </span>
                                {link && (
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-black text-primary hover:text-white hover:bg-primary px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-primary/10 uppercase tracking-widest"
                                    >
                                        Buka Resource
                                        <LinkIcon size={14} />
                                    </a>
                                )}
                            </div>

                            {material.type === 'TEXT' && (
                                <div className="mt-6 p-6 bg-slate-50 rounded-2xl text-sm text-slate-700 font-medium leading-relaxed border border-slate-100">
                                    {material.content}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {materials.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                    Belum ada materi dibagikan.
                </div>
            )}
        </div>
    );
}
