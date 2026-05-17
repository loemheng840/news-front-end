"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Bell, Mail, UserPlus, MessageSquare, Heart } from "lucide-react";
import { useGetNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: settings, isLoading } = useGetNotificationSettingsQuery(undefined, { skip: !user });
    const [updateSettings] = useUpdateNotificationSettingsMutation();

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user) {
        redirect("/login");
    }

    const handleToggle = (key: string, value: boolean) => {
        updateSettings({ [key]: value });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Settings className="h-6 w-6" /> Settings
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" /> Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose which notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="text-sm font-medium">Email Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings?.email_notifications ?? true}
                            onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="text-sm font-medium">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive push notifications</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings?.push_notifications ?? true}
                            onCheckedChange={(checked) => handleToggle("push_notifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserPlus className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="text-sm font-medium">Follow Notifications</Label>
                                <p className="text-xs text-muted-foreground">When someone follows you or an author you follow publishes</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings?.follow_notifications ?? true}
                            onCheckedChange={(checked) => handleToggle("follow_notifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="text-sm font-medium">Comment Notifications</Label>
                                <p className="text-xs text-muted-foreground">When someone comments on your articles</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings?.comment_notifications ?? true}
                            onCheckedChange={(checked) => handleToggle("comment_notifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <Label className="text-sm font-medium">Like Notifications</Label>
                                <p className="text-xs text-muted-foreground">When someone likes your articles</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings?.like_notifications ?? true}
                            onCheckedChange={(checked) => handleToggle("like_notifications", checked)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
