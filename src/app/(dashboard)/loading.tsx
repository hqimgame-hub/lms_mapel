export default function DashboardLoading() {
    return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="font-black text-slate-800 tracking-tight">Memuat Data...</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LMS Sekolah - Harap Tunggu</p>
            </div>
        </div>
    );
}
