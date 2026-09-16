'use client';

import { useEffect, useState, useRef } from 'react';
import { RefreshCcw, AlertOctagon, Loader2 } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [retrying, setRetrying] = useState(false);
    const [countdown, setCountdown] = useState(2);
    const hasAutoRetriedRef = useRef(false);

    useEffect(() => {
        console.error('[DASHBOARD ERROR]', error);

        // Check if we already auto-retried recently in this browser session (30s cooldown)
        const lastRetry = sessionStorage.getItem('dashboard_last_auto_retry');
        const now = Date.now();
        const canAutoRetry = !lastRetry || (now - parseInt(lastRetry, 10)) > 30000;

        if (canAutoRetry && !hasAutoRetriedRef.current) {
            hasAutoRetriedRef.current = true;
            setRetrying(true);
            sessionStorage.setItem('dashboard_last_auto_retry', now.toString());

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        reset();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [error, reset]);

    const isConnectionError = error.message?.toLowerCase().includes('connection') ||
        error.message?.toLowerCase().includes('timeout') ||
        error.message?.toLowerCase().includes('pool') ||
        error.message?.toLowerCase().includes("can't reach");

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 mb-6">
                    {retrying ? <Loader2 size={32} className="animate-spin" /> : <AlertOctagon size={32} />}
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                    {retrying ? "Menghubungkan Ulang..." : "Gagal Memuat Dashboard"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {retrying
                        ? `Koneksi database sedang disiapkan. Memuat ulang otomatis dalam ${countdown} detik...`
                        : isConnectionError
                            ? "Koneksi ke database cloud sempat terputus sesaat. Silakan klik tombol muat ulang di bawah."
                            : "Terjadi kesalahan saat memuat data dashboard. Silakan coba muat ulang."
                    }
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
                    disabled={retrying}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={retrying ? "animate-spin" : ""} />
                    Muat Ulang Sekarang
                </button>
            </div>
        </div>
    );
}
