'use client';

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export function IdleTimer() {
    const { data: session } = useSession();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 15 Menit dalam milidetik
    const TIMEOUT_MS = 15 * 60 * 1000;

    const handleLogout = useCallback(async () => {
        if (session) {
            console.log("User idle for too long, logging out...");
            await signOut({ redirect: false });
            router.push("/login?error=SessionExpired");
        }
    }, [session, router]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (session?.user) {
            timerRef.current = setTimeout(handleLogout, TIMEOUT_MS);
        }
    }, [session, handleLogout, TIMEOUT_MS]);

    useEffect(() => {
        // Events that reset the timer
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        // Initial setup
        resetTimer();

        // Attach listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer]);

    return null; // This component doesn't render anything visually
}
