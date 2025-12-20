import Link from "next/link";

interface CourseCardProps {
    id: string;
    subjectName: string;
    className: string; // The class name, e.g. "X-1"
    studentCount?: number;
    description?: string;
}

export function CourseCard({ id, subjectName, className, studentCount, description }: CourseCardProps) {
    return (
        <Link href={`/teacher/courses/${id}`} className="block">
            <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{subjectName}</h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">Class {className}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                        TEACHER
                    </div>
                </div>

                {description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                        {description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm text-gray-500">
                    <span>{studentCount !== undefined ? `${studentCount} Students` : 'View Details'}</span>
                    <span className="text-primary font-medium hover:underline">Manage &rarr;</span>
                </div>
            </div>
        </Link>
    );
}
