import { getClasses } from "@/actions/classes";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
    const classes = await getClasses();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-primary p-6 text-white text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Daftar Akun Siswa</h1>
                    <p className="text-blue-100 text-sm mt-1">Silakan isi data diri Anda untuk memulai</p>
                </div>

                <div className="p-8">
                    <RegisterForm classes={classes} />

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
