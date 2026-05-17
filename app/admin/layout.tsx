"use client";

import { Navbar } from "@/components/navbar";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <div className="flex-1 overflow-auto">{children}</div>
            </div>
        </>
    );
}
