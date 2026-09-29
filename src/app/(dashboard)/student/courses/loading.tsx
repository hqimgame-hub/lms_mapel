export default function StudentCoursesLoading() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-5 w-72 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 h-48"
                    />
                ))}
            </div>
        </div>
    );
}
