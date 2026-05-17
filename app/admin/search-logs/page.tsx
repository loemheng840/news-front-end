"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { useGetSearchLogsQuery } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

export default function SearchLogsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);

    const params: Record<string, string | number> = { page };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const { data: logsData, isLoading } = useGetSearchLogsQuery(params, {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Search className="h-6 w-6" /> Search Analytics
                </h1>
            </div>

            {/* Date Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Query</TableHead>
                                <TableHead>Results</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No search logs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.query}</TableCell>
                                        <TableCell>{log.result_count}</TableCell>
                                        <TableCell className="text-sm">{log.user_id ? `#${log.user_id}` : "Guest"}</TableCell>
                                        <TableCell className="text-sm font-mono">{log.ip_address}</TableCell>
                                        <TableCell className="text-sm">{format(new Date(log.created_at), "MMM d, HH:mm")}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {logsData && (logsData.last_page ?? 1) > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span className="px-3 py-1 text-sm">Page {page} of {logsData.last_page}</span>
                    <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page >= (logsData.last_page ?? 1)} onClick={() => setPage(page + 1)}>Next</button>
                </div>
            )}
        </div>
    );
}
