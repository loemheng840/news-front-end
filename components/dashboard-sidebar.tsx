"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
    FileText,
    Plus,
    User,
    Bell,
    Settings,
    Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[]; // which roles can see this link
}

const dashboardLinks: SidebarLink[] = [
    { name: "My Articles", href: "/dashboard", icon: FileText, roles: ["AUTHOR", "ADMIN"] },
    { name: "New Article", href: "/dashboard/new", icon: Plus, roles: ["AUTHOR", "ADMIN"] },
    { name: "Profile", href: "/dashboard/profile", icon: User, roles: ["AUTHOR", "ADMIN", "READER"] },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["AUTHOR", "ADMIN", "READER"] },
    { name: "Media Library", href: "/dashboard/media", icon: Image, roles: ["AUTHOR", "ADMIN"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["AUTHOR", "ADMIN", "READER"] },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Don't show sidebar if not logged in or if user is a READER
    // (READERs only see profile/notifications/settings — no full dashboard)
    if (!user) return null;
    if (user.role === "READER") return null;

    const visibleLinks = dashboardLinks.filter((link) =>
        link.roles.includes(user.role as UserRole)
    );

    return (
        <aside className="w-64 shrink-0 border-r bg-background hidden lg:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
                <div className="mb-6">
                    <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Dashboard
                    </h2>
                </div>
                <nav className="space-y-1">
                    {visibleLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
