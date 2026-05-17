"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image, Upload, Trash2, Loader2, FileText, Video, File } from "lucide-react";
import { useGetMediaQuery, useUploadMediaMutation, useDeleteMediaMutation } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import type { MediaLibraryItem } from "@/lib/types";

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />;
    if (mimeType === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaLibraryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: mediaData, isLoading } = useGetMediaQuery(undefined, { skip: !user });
    const [uploadMedia, { isLoading: uploading }] = useUploadMediaMutation();
    const [deleteMedia] = useDeleteMediaMutation();
    const [altText, setAltText] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user || !["AUTHOR", "ADMIN"].includes(user.role)) {
        redirect("/");
    }

    const mediaItems = mediaData?.data || [];

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("file", file);
        if (altText) formData.append("alt_text", altText);

        try {
            await uploadMedia(formData).unwrap();
            setSuccess("File uploaded successfully");
            setAltText("");
            e.target.value = "";
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || "Upload failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this file?")) return;
        try {
            await deleteMedia(id).unwrap();
            setSuccess("File deleted");
        } catch {
            setError("Failed to delete file");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Image className="h-6 w-6" /> Media Library
                </h1>
            </div>

            {success && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

            {/* Upload Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Upload File</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="alt_text">Alt Text (optional)</Label>
                            <Input id="alt_text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the file..." />
                        </div>
                        <div>
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploading ? "Uploading..." : "Choose File"}
                                </div>
                            </Label>
                            <Input id="file-upload" type="file" className="hidden" accept="image/*,application/pdf,video/mp4" onChange={handleUpload} disabled={uploading} />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Max 10MB. Allowed: JPEG, PNG, GIF, WebP, PDF, MP4</p>
                </CardContent>
            </Card>

            {/* Media Grid */}
            {mediaItems.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Image className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No media files yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item: MediaLibraryItem) => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="aspect-square bg-muted flex items-center justify-center relative group">
                                {item.mime_type.startsWith("image/") ? (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${item.path}`}
                                        alt={item.alt_text || item.filename}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getFileIcon(item.mime_type)
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <p className="text-sm font-medium truncate">{item.filename}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <Badge variant="secondary" className="text-xs">{item.mime_type.split("/")[1]}</Badge>
                                    <span className="text-xs text-muted-foreground">{formatFileSize(item.file_size)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
