"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
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
import AuthDashboardPage from "../dashboard/author/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  MoreVertical,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Settings,
  Loader2,
  Trash2,
  Edit,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Flag,
  Shield,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format, subMonths, eachMonthOfInterval } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { User as AppUser } from "@/lib/types";
import {
  useCreateCategoryMutation,
  useCreateTagMutation,
  useDeleteCategoryMutation,
  useDeleteUserMutation,
  useGetAdminArticlesQuery,
  useGetCategoriesQuery,
  useGetTagsQuery,
  useGetUsersQuery,
  useUpdateCategoryMutation,
  useUpdateUserRoleMutation,
} from "@/lib/redux/news-api";

// Color palette for charts
const CHART_COLORS = {
  primary: "#8884d8",
  secondary: "#82ca9d",
  tertiary: "#ffc658",
  quaternary: "#ff8042",
  background: "#f5f5f5",
};

interface Article {
  id: string;
  title: string;
  content?: string;
  status: string;
  author_id: string;
  category?: string | { id: string; name: string; slug: string };
  created_at: string;
  likes_count?: number;
  likes?: any[];
  bookmarks?: any[];
  views?: number;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("AUTHOR");
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } =
    useGetUsersQuery(undefined, { skip: !user || user.role !== "ADMIN" });
  const {
    data: articles = [],
    isLoading: loadingArticles,
    refetch: refetchArticles,
  } = useGetAdminArticlesQuery(undefined, {
    skip: !user || user.role !== "ADMIN",
  });
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: tags = [] } = useGetTagsQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategoryMutation] = useUpdateCategoryMutation();
  const [deleteCategoryMutation] = useDeleteCategoryMutation();
  const [createTag] = useCreateTagMutation();
  const [updateUserRoleMutation] = useUpdateUserRoleMutation();
  const [deleteUserMutation] = useDeleteUserMutation();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Helper function to get category name safely
  const getCategoryName = (category: any): string => {
    if (!category) return "Uncategorized";
    if (typeof category === "string") return category;
    if (typeof category === "object" && category !== null) {
      return category.name || "Uncategorized";
    }
    return "Uncategorized";
  };

  // Generate analytics data based on articles and users
  const analyticsData = useMemo(() => {
    // Generate monthly data for the last 6 months
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    }).reverse();

    return months.map((month, index) => {
      const monthArticles = articles.filter(
        (article) =>
          new Date(article.created_at).getMonth() === month.getMonth() &&
          new Date(article.created_at).getFullYear() === month.getFullYear(),
      );

      const monthUsers = users.filter(
        (user) =>
          new Date(user.created_at).getMonth() === month.getMonth() &&
          new Date(user.created_at).getFullYear() === month.getFullYear(),
      );

      return {
        name: format(month, "MMM"),
        articles: monthArticles.length,
        users: monthUsers.length,
        published: monthArticles.filter((a) => a.status === "PUBLISHED").length,
        engagement: monthArticles.reduce(
          (acc, a) =>
            acc +
            (a.likes_count || a.likes?.length || 0) +
            (a.bookmarks?.length || 0),
          0,
        ),
      };
    });
  }, [articles, users]);

  // User role distribution for pie chart
  const userRoleData = useMemo(() => {
    const roleCount = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(roleCount).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }));
  }, [users]);

  // Article status distribution
  const articleStatusData = useMemo(() => {
    const statusCount = articles.reduce(
      (acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(statusCount).map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
    }));
  }, [articles]);

  // Top performing articles
  const topArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => {
        const aEngagement =
          (a.likes_count || a.likes?.length || 0) + (a.bookmarks?.length || 0);
        const bEngagement =
          (b.likes_count || b.likes?.length || 0) + (b.bookmarks?.length || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 5);
  }, [articles]);

  const handleEditRole = (user: AppUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateUserRoleMutation({
        id: selectedUser.id,
        role: editRole,
      }).unwrap();
      setSuccess("User role updated successfully");
      setEditDialogOpen(false);
      refetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update user role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: AppUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteUserMutation(selectedUser.id).unwrap();
      setSuccess("User deleted successfully");
      setDeleteDialogOpen(false);
      refetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createCategory({ name: newCategoryName.trim() }).unwrap();
      setNewCategoryName("");
      setSuccess("Category created");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingCategoryName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateCategoryMutation({
        id,
        data: { name: editingCategoryName.trim() },
      }).unwrap();
      setEditingCategoryId(null);
      setEditingCategoryName("");
      setSuccess("Category updated");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteCategoryMutation(id).unwrap();
      setSuccess("Category deleted");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createTag({ name: newTagName.trim() }).unwrap();
      setNewTagName("");
      setSuccess("Tag created");
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Failed to create tag");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingUsers || loadingArticles) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // Stats calculations
  const stats = {
    totalUsers: users.length,
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    activeUsers: users.filter((u) => Boolean(u.email_verified_at)).length,
    newUsersThisMonth: users.filter((u) => {
      const userDate = new Date(u.created_at);
      const now = new Date();
      return (
        userDate.getMonth() === now.getMonth() &&
        userDate.getFullYear() === now.getFullYear()
      );
    }).length,
    totalEngagement: articles.reduce(
      (acc, a) =>
        acc +
        (a.likes_count || a.likes?.length || 0) +
        (a.bookmarks?.length || 0),
      0,
    ),
    engagementRate:
      articles.length > 0
        ? Math.round(
          (articles.reduce(
            (acc, a) => acc + (a.likes_count || a.likes?.length || 0),
            0,
          ) /
            articles.length) *
          100,
        ) / 100
        : 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="mb-4">
            {error && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-md border border-red-200 mb-2">
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

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive overview of platform analytics and user management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-white">
              <Calendar className="mr-2 h-4 w-4" />{" "}
              {format(new Date(), "MMM d, yyyy")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  +{stats.newUsersThisMonth} this month
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>12%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {stats.published} published
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Total Articles
              </p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-bold">{stats.totalArticles}</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Active
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Engagement Rate
              </p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-bold">{stats.engagementRate}</p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>18%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200"
                >
                  {timeRange}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-600">
                Total Engagement
              </p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-bold">
                  {stats.totalEngagement.toLocaleString()}
                </p>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>34%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Growth Analytics</CardTitle>
                  <CardDescription>
                    Articles vs Users (Last 6 months)
                  </CardDescription>
                </div>
                <Select
                  value={timeRange}
                  onValueChange={(value: any) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="articles"
                      name="Articles"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="New Users"
                      stroke={CHART_COLORS.secondary}
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Role and Status Overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                CHART_COLORS.primary,
                                CHART_COLORS.secondary,
                                CHART_COLORS.tertiary,
                                CHART_COLORS.quaternary,
                              ][index % 4]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Active Users</span>
                      <Badge variant="secondary">{stats.activeUsers}</Badge>
                    </div>
                    <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(stats.activeUsers / stats.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">New This Month</span>
                      <Badge variant="secondary">
                        {stats.newUsersThisMonth}
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(stats.newUsersThisMonth / stats.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Engagement Score</span>
                      <Badge variant="secondary">{stats.engagementRate}</Badge>
                    </div>
                    <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(stats.engagementRate * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles, permissions, and accounts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {paginatedUsers.length} of {filteredUsers.length}{" "}
                  users
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found. {searchQuery && "Try a different search term."}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const userArticles = articles.filter(
                        (a) => a.author_id === user.id,
                      );
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-sm text-gray-500">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "ADMIN"
                                  ? "destructive"
                                  : user.role === "AUTHOR"
                                    ? "default"
                                    : "secondary"
                              }
                              className="capitalize"
                            >
                              {user.role.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>{userArticles.length}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${user.email_verified_at ? "bg-green-500" : "bg-gray-400"}`}
                              />
                              <span className="text-sm">
                                {user.email_verified_at ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(
                                  new Date(user.created_at),
                                  "MMM d, yyyy",
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(user.created_at), "h:mm a")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(user)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Taxonomy</CardTitle>
            <CardDescription>
              Manage categories and tags used by articles
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Categories</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button onClick={handleCreateCategory} disabled={submitting}>
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-md border p-2"
                  >
                    {editingCategoryId === cat.id ? (
                      <>
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateCategory(cat.id)}
                          disabled={submitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{cat.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategoryId(cat.id);
                            setEditingCategoryName(cat.name);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Tags</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="New tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <Button onClick={handleCreateTag} disabled={submitting}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <AuthDashboardPage />
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
                  <SelectItem value="READER">Reader</SelectItem>
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
              className="bg-red-600 text-white hover:bg-red-700"
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
