"use client";

import { Navbar } from "@/components/navbar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="flex flex-1">
                <DashboardSidebar />
                <div className="flex-1 overflow-auto">{children}</div>
            </div>
        </>
    );
}
