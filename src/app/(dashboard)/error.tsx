'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertOctagon } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                    <AlertOctagon size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Gagal Memuat Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Terjadi kesalahan saat memuat data dashboard. Silakan coba muat ulang.
                </p>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-6 text-left border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-mono text-red-500 break-all">
                        {error.message}
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                            ID: {error.digest}
                        </p>
                    )}
                </div>

                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    <RefreshCcw size={18} />
                    Muat Ulang
                </button>
            </div>
        </div>
    );
}
