'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface NavItemProps {
    href: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
    label?: string;
    onClick?: () => void;
}

export function NavItem({ href, children, icon, label, onClick }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    const content = (
        <div className="flex items-center gap-3">
            {icon && <span className={clsx(isActive ? "text-white" : "text-gray-500")}>{icon}</span>}
            <span>{label || children}</span>
        </div>
    );

    return (
        <Link
            href={href}
            onClick={onClick}
            className={clsx(
                "p-3 rounded-xl transition-all block text-sm font-extrabold tracking-tight",
                isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25 active:scale-[0.98]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary active:scale-[0.98]"
            )}
        >
            {content}
        </Link>
    );
}
