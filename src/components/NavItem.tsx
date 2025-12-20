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
                "p-2 rounded transition-colors block text-sm font-medium",
                isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
            )}
        >
            {content}
        </Link>
    );
}
