export default function StudentDashboardLoading() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-9 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-5 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-5"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                        <div className="flex flex-col gap-2">
                            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                            <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-20"
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-24" />
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-[2rem] h-36" />
                </div>
            </div>
        </div>
    );
}
