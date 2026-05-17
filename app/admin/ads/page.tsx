"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useGetAdPlacementsQuery, useCreateAdPlacementMutation, useUpdateAdPlacementMutation, useDeleteAdPlacementMutation, useGetAdAnalyticsQuery } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import type { AdPlacement } from "@/lib/types";

export default function AdminAdsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: placementsData, isLoading } = useGetAdPlacementsQuery(undefined, { skip: !user || user?.role !== "ADMIN" });
    const { data: analytics } = useGetAdAnalyticsQuery(undefined, { skip: !user || user?.role !== "ADMIN" });
    const [createPlacement] = useCreateAdPlacementMutation();
    const [updatePlacement] = useUpdateAdPlacementMutation();
    const [deletePlacement] = useDeleteAdPlacementMutation();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AdPlacement | null>(null);
    const [name, setName] = useState("");
    const [position, setPosition] = useState<string>("HEADER");
    const [type, setType] = useState<string>("BANNER");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);

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

    const placements = placementsData?.data || [];

    const openCreate = () => {
        setEditing(null);
        setName("");
        setPosition("HEADER");
        setType("BANNER");
        setStartDate("");
        setEndDate("");
        setIsActive(true);
        setDialogOpen(true);
    };

    const openEdit = (p: AdPlacement) => {
        setEditing(p);
        setName(p.name);
        setPosition(p.position);
        setType(p.type);
        setStartDate(p.start_date || "");
        setEndDate(p.end_date || "");
        setIsActive(p.is_active);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        const data: Partial<AdPlacement> = {
            name,
            position: position as AdPlacement["position"],
            type: type as AdPlacement["type"],
            start_date: startDate || null,
            end_date: endDate || null,
            is_active: isActive,
        };

        if (editing) {
            await updatePlacement({ id: editing.id, data });
        } else {
            await createPlacement(data);
        }
        setDialogOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this ad placement?")) return;
        await deletePlacement(id);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="h-6 w-6" /> Ad Management
                </h1>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" /> New Placement
                </Button>
            </div>

            {/* Analytics Summary */}
            {analytics && analytics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Total Impressions</p>
                            <p className="text-2xl font-bold">{analytics.reduce((sum, a) => sum + a.total_impressions, 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Total Clicks</p>
                            <p className="text-2xl font-bold">{analytics.reduce((sum, a) => sum + a.total_clicks, 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">Avg CTR</p>
                            <p className="text-2xl font-bold">
                                {analytics.length > 0
                                    ? (analytics.reduce((sum, a) => sum + (a.click_through_rate || 0), 0) / analytics.length * 100).toFixed(2)
                                    : 0}%
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Placements Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {placements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No ad placements yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                placements.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell><Badge variant="outline">{p.position}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{p.type}</Badge></TableCell>
                                        <TableCell className="text-sm">
                                            {p.start_date ? format(new Date(p.start_date), "MMM d") : "—"}
                                            {" → "}
                                            {p.end_date ? format(new Date(p.end_date), "MMM d") : "∞"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={p.is_active ? "default" : "secondary"}>
                                                {p.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(p.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit" : "Create"} Ad Placement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad placement name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Position</Label>
                                <Select value={position} onValueChange={setPosition}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HEADER">Header</SelectItem>
                                        <SelectItem value="SIDEBAR">Sidebar</SelectItem>
                                        <SelectItem value="IN_ARTICLE">In Article</SelectItem>
                                        <SelectItem value="FOOTER">Footer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BANNER">Banner</SelectItem>
                                        <SelectItem value="NATIVE">Native</SelectItem>
                                        <SelectItem value="VIDEO">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                            <Label>Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
