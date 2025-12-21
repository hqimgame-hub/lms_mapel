
import { auth } from "@/auth";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function Header() {
    const session = await auth();

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full transition-colors duration-300">
            <div className="flex items-center gap-3">
                <MobileNav
                    role={session?.user?.role}
                    userName={session?.user?.name}
                    userEmail={session?.user?.email}
                />
                <div className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                    {session?.user?.role === 'TEACHER' ? 'Dashboard Guru' : session?.user?.role === 'STUDENT' ? 'Dashboard Siswa' : 'Dashboard Admin'}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                {/* Placeholders for notifications or profile dropdown */}
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {session?.user?.name?.[0] || 'U'}
                </div>
            </div>
        </header>
    );
}
