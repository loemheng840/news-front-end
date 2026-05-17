"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Loader2 } from "lucide-react";
import { useGetAuditLogsQuery } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditLogsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [actionFilter, setActionFilter] = useState<string>("");
    const [page, setPage] = useState(1);

    const params: Record<string, string | number> = { page };
    if (actionFilter && actionFilter !== "all") params.action = actionFilter;

    const { data: logsData, isLoading } = useGetAuditLogsQuery(params, {
        skip: !user || user?.role !== "ADMIN",
    });

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        redirect("/");
    }

    const logs = logsData?.data || [];

    const actionBadge = (action: string) => {
        switch (action) {
            case "created": return <Badge className="bg-green-100 text-green-700">Created</Badge>;
            case "updated": return <Badge className="bg-blue-100 text-blue-700">Updated</Badge>;
            case "deleted": return <Badge className="bg-red-100 text-red-700">Deleted</Badge>;
            case "login": return <Badge className="bg-purple-100 text-purple-700">Login</Badge>;
            case "logout": return <Badge className="bg-gray-100 text-gray-700">Logout</Badge>;
            default: return <Badge variant="secondary">{action}</Badge>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6" /> Audit Logs
                </h1>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No audit logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm whitespace-nowrap">
                                            {format(new Date(log.created_at), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.user_id ? `User #${log.user_id}` : "System"}
                                        </TableCell>
                                        <TableCell>{actionBadge(log.action)}</TableCell>
                                        <TableCell className="text-sm">
                                            {log.model_type ? (
                                                <span className="font-mono text-xs">
                                                    {log.model_type.split("\\").pop()} #{log.model_id}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm font-mono">{log.ip_address || "—"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {logsData && (logsData.last_page ?? 1) > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {page} of {logsData.last_page}</span>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={page >= (logsData.last_page ?? 1)}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
