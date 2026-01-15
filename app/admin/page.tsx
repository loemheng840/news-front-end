"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { mockArticles, mockCategories } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Globe,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  Loader2,
  Trash2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getPendingComments } from "@/lib/engagement";
import AuthDashboardPage from "../dashboard/author/page";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const { user, isLoading, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("AUTHOR");

  useEffect(() => {
    if (!user) return;
    loadUsers();
    loadArticles();
  }, [user]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadArticles = async () => {
    try {
      const res = await fetch(`${API}/articles/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to load articles");

      const json = await res.json();
      setArticles(json.data || json);
    } catch (err) {
      console.error(err);
      setError("Failed to load articles");
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleEditRole = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ role: editRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user role");
      }

      setSuccess("User role updated successfully");
      setEditDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update user role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      setSuccess("User deleted successfully");
      setDeleteDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingUsers || loadingArticles) return null;
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const pendingComments = getPendingComments();

  const stats = {
    totalUsers: users.length,
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    activeSubscribers: 1240,
    monthlyRevenue: "$15,420",
    pendingComments: pendingComments.length,
    totalEngagement: articles.reduce(
      (acc, a) =>
        acc +
        (a.likes_count || a.likes?.length || 0) +
        (a.bookmarks?.length || 0),
      0
    ),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="mb-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-800 px-4 py-3 rounded-md border border-green-200">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              System Administration
            </h1>
            <p className="text-muted-foreground">
              Global overview of NewsHub users, content, and system health.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">
              <BarChart3 className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button className="bg-accent hover:bg-accent/90">
              <Settings className="mr-2 h-4 w-4" /> Config
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: Users,
              trend: "+12%",
            },
            {
              label: "Total Articles",
              value: stats.totalArticles,
              icon: FileText,
              trend: "+5%",
            },
            {
              label: "Published",
              value: stats.published,
              icon: CheckCircle2,
              trend: `${stats.published}/${stats.totalArticles}`,
            },
            {
              label: "Drafts",
              value: stats.drafts,
              icon: FileText,
              trend: `${stats.drafts}/${stats.totalArticles}`,
            },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span
                    className={`text-xs font-medium ${
                      stat.trend.includes("/")
                        ? "text-muted-foreground"
                        : "text-green-500"
                    } flex items-center`}
                  >
                    {stat.trend.includes("/") ? (
                      stat.trend
                    ) : (
                      <>
                        {stat.trend} <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="content">System Content</TabsTrigger>
            <TabsTrigger value="comments">
              Comment Moderaticontenton
            </TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Users</CardTitle>
                <CardDescription>
                  Manage user roles, permissions, and account status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {u.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {u.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === "ADMIN" ? "default" : "secondary"
                              }
                              className="capitalize"
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  u.status === 1
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                              <span className="text-sm">
                                {u.status === 1 ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(u.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(u)}
                              >
                                Change Role
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDeleteClick(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <AuthDashboardPage />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Global Site Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide behavior and appearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 py-4">
                  {[
                    {
                      title: "Public Registration",
                      desc: "Allow new users to sign up",
                      icon: Globe,
                    },
                    {
                      title: "Content Moderation",
                      desc: "Require admin approval for posts",
                      icon: ShieldAlert,
                    },
                    {
                      title: "Revenue Reports",
                      desc: "Enable automated billing metrics",
                      icon: TrendingUp,
                    },
                  ].map((setting, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                          <setting.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{setting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.desc}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name}. This will affect their
              permissions on the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editRole}
                onValueChange={setEditRole}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTHOR">Author</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account for "{selectedUser?.name}" and remove all their data
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
