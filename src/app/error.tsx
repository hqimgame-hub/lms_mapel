'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950 text-center">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-md w-full">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertTriangle size={32} />
                </div>

                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Terjadi Kesalahan!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Maaf, terjadi kesalahan saat memuat halaman ini.
                </p>

                {/* Show error details in development or if needed */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-6 text-left overflow-auto max-h-40">
                    <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                        {error.message || "Unknown error occurred"}
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>

                <button
                    onClick={() => reset()}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <RefreshCcw size={18} />
                    Coba Lagi
                </button>
            </div>
        </div>
    );
}
