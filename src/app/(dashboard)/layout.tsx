import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-10 flex flex-col">
                    <div className="max-w-[1440px] mx-auto w-full flex-1">
                        {children}
                    </div>
                    <footer className="mt-12 pt-6 pb-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500 max-w-[1440px] mx-auto w-full">
                        <p className="font-medium">
                            LMS Digital Learning Platform
                        </p>
                        <p className="font-medium">
                            Dikembangkan oleh <span className="font-semibold text-slate-600 dark:text-slate-300">MIDStudio</span> sejak tahun 2025
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
