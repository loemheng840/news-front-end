"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
    BarChart3,
    Users,
    FileText,
    Tag,
    FolderTree,
    Flag,
    Shield,
    Search,
    Megaphone,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "Reports", href: "/admin/reports", icon: Flag },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
    { name: "Search Analytics", href: "/admin/search-logs", icon: Search },
    { name: "Ad Management", href: "/admin/ads", icon: Megaphone },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user || user.role !== "ADMIN") return null;

    return (
        <aside className="w-64 shrink-0 border-r bg-background hidden lg:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
                <div className="mb-6">
                    <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Admin Panel
                    </h2>
                </div>
                <nav className="space-y-1">
                    {adminLinks.map((link) => {
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
