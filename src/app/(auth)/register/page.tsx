import { getClasses } from "@/actions/classes";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
    const classes = await getClasses();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden backdrop-blur-xl">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 dark:from-primary/90 dark:via-blue-700/90 dark:to-blue-800/90 p-10 text-white text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="bg-white/10 w-20 h-20 rounded-3xl backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center mx-auto mb-6">
                            <UserPlus size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Daftar Akun Siswa</h1>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.25em] opacity-90">Buat Akun Perjalanan Belajarmu</p>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <RegisterForm classes={classes} />

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline transition-colors">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
