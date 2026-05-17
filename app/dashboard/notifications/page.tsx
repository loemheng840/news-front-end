"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, CheckCheck, Loader2, MessageSquare, Heart, UserPlus, FileText } from "lucide-react";
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from "@/lib/redux/news-api";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/lib/types";

const notificationIcon = (type: Notification["type"]) => {
    switch (type) {
        case "NEW_ARTICLE": return <FileText className="h-5 w-5 text-blue-500" />;
        case "COMMENT": return <MessageSquare className="h-5 w-5 text-green-500" />;
        case "LIKE": return <Heart className="h-5 w-5 text-red-500" />;
        case "FOLLOW": return <UserPlus className="h-5 w-5 text-purple-500" />;
        default: return <Bell className="h-5 w-5" />;
    }
};

const notificationMessage = (notification: Notification): string => {
    const data = notification.data as Record<string, string>;
    switch (notification.type) {
        case "NEW_ARTICLE":
            return `${data.author_name || "Someone"} published "${data.article_title || "a new article"}"`;
        case "COMMENT":
            return `${data.commenter_name || "Someone"} commented on "${data.article_title || "your article"}"`;
        case "LIKE":
            return `${data.liker_name || "Someone"} liked "${data.article_title || "your article"}"`;
        case "FOLLOW":
            return `${data.follower_name || "Someone"} started following you`;
        default:
            return "You have a new notification";
    }
};

export default function NotificationsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { data: notificationsData, isLoading } = useGetNotificationsQuery(undefined, { skip: !user });
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead] = useMarkAllNotificationsReadMutation();

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

    const notifications = notificationsData?.data || [];
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6" /> Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={() => markAllRead()}>
                        <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No notifications yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`cursor-pointer transition-colors ${!notification.read_at ? "bg-blue-50/50 border-blue-100" : ""}`}
                            onClick={() => !notification.read_at && markRead(notification.id)}
                        >
                            <CardContent className="flex items-start gap-3 py-4">
                                <div className="mt-0.5">{notificationIcon(notification.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.read_at ? "font-medium" : ""}`}>
                                        {notificationMessage(notification)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notification.read_at && (
                                    <Badge variant="secondary" className="text-xs shrink-0">New</Badge>
                                )}
                                {notification.read_at && (
                                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
