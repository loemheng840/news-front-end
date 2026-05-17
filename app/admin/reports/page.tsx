"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useGetAdminReportsQuery, useReviewReportMutation } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminReportsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [statusFilter, setStatusFilter] = useState<string>("");
    const { data: reportsData, isLoading } = useGetAdminReportsQuery(
        statusFilter && statusFilter !== "all" ? { status: statusFilter } : undefined,
        { skip: !user || user?.role !== "ADMIN" }
    );
    const [reviewReport] = useReviewReportMutation();

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

    const reports = reportsData?.data || [];

    const handleReview = async (id: number, status: "REVIEWED" | "REJECTED") => {
        await reviewReport({ id, status });
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
            case "REVIEWED": return <Badge variant="outline" className="bg-green-50 text-green-700">Reviewed</Badge>;
            case "REJECTED": return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Flag className="h-6 w-6" /> Content Reports
                </h1>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No reports found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-mono text-sm">#{report.id}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{report.target_type}</Badge>
                                            <span className="ml-2 text-sm text-muted-foreground">#{report.target_id}</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                                        <TableCell>{statusBadge(report.status)}</TableCell>
                                        <TableCell className="text-sm">{format(new Date(report.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-right">
                                            {report.status === "PENDING" && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleReview(report.id, "REVIEWED")}>
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleReview(report.id, "REJECTED")}>
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
