
import { auth } from "@/auth";
import { MobileNav } from "@/components/MobileNav";

export async function Header() {
    const session = await auth();

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-3">
                <MobileNav role={session?.user?.role} />
                <div className="text-lg font-semibold text-gray-700 capitalize">
                    {/* Could be breadcrumbs, currently just a welcome text or empty */}
                    Dashboard {session?.user?.role === 'TEACHER' ? 'Guru' : session?.user?.role === 'STUDENT' ? 'Siswa' : 'Admin'}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {/* Placeholders for notifications or profile dropdown */}
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {session?.user?.name?.[0] || 'U'}
                </div>
            </div>
        </header>
    );
}
