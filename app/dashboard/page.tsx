"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Clock,
  Search,
  Filter,
  MoreVertical,
  CalendarDays,
  User,
  EyeOff,
  ThumbsUp,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import {
  useDeleteArticleMutation,
  useGetMyArticlesQuery,
  useUpdateArticleMutation,
} from "@/lib/redux/news-api";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    status: "DRAFT",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const {
    data: articles = [],
    isLoading: loading,
    refetch: refetchArticles,
  } = useGetMyArticlesQuery(undefined, {
    skip: !user || (user.role !== "ADMIN" && user.role !== "AUTHOR"),
  });
  const [updateArticleMutation] = useUpdateArticleMutation();
  const [deleteArticleMutation] = useDeleteArticleMutation();
  const getViewCount = (views: any) =>
    typeof views === "number" ? views : Array.isArray(views) ? views.length : 0;

  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (article) => article.status === activeTab.toUpperCase(),
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "views":
          return getViewCount(b.views) - getViewCount(a.views);
        case "likes":
          return (b.likes_count || 0) - (a.likes_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [articles, searchQuery, activeTab, sortBy]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleEdit = (article: any) => {
    setSelectedArticle(article);
    setEditForm({
      title: article.title,
      content: article.content,
      status: article.status,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedArticle) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateArticleMutation({
        id: selectedArticle.id,
        data: {
          ...editForm,
          status: editForm.status as "DRAFT" | "PUBLISHED",
        },
      }).unwrap();
      setSuccess("Article updated successfully");
      setEditDialogOpen(false);
      refetchArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update article");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (article: any) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteArticleMutation(selectedArticle.id).unwrap();
      setSuccess("Article deleted successfully");
      setDeleteDialogOpen(false);
      refetchArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete article");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "AUTHOR")) {
    redirect("/");
  }

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    views: articles.reduce((sum, a) => sum + getViewCount(a.views), 0),
    likes: articles.reduce((sum, a) => sum + (a.likes_count || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PUBLISHED: "bg-green-500/10 text-green-700 border-green-500/20",
      DRAFT: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      ARCHIVED: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };

    const icons = {
      PUBLISHED: <CheckCircle2 className="h-3 w-3" />,
      DRAFT: <FileText className="h-3 w-3" />,
      ARCHIVED: <EyeOff className="h-3 w-3" />,
    };

    return (
      <Badge
        variant="outline"
        className={`gap-1.5 ${variants[status as keyof typeof variants] || "bg-gray-500/10"}`}
      >
        {icons[status as keyof typeof icons] || (
          <AlertCircle className="h-3 w-3" />
        )}
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your articles and track performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Article
                </Link>
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {(error || success) && (
            <div className="mb-6 animate-in fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Articles
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Published
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.published}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">
                    Drafts
                  </p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {stats.drafts}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-600/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.views}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-600/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pink-700 mb-1">
                    Total Likes
                  </p>
                  <p className="text-3xl font-bold text-pink-900">
                    {stats.likes}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-600/10 flex items-center justify-center">
                  <ThumbsUp className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-border/40">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                  Manage and organize all your content in one place
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="likes">Most Likes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary/10"
                >
                  All
                  <Badge variant="secondary" className="ml-2">
                    {articles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-700"
                >
                  Published
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500/10 text-green-700"
                  >
                    {stats.published}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-700"
                >
                  Drafts
                  <Badge
                    variant="outline"
                    className="ml-2 bg-yellow-500/10 text-yellow-700"
                  >
                    {stats.drafts}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className="data-[state=active]:bg-gray-500/10 data-[state=active]:text-gray-700"
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-0">
            {filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No articles found
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery
                    ? "No articles match your search criteria. Try different keywords."
                    : "Get started by creating your first article."}
                </p>
                <Button asChild>
                  <Link href="/dashboard/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Article</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Likes</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow
                        key={article.id}
                        className="group hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Link
                              href={`/article/${article.slug}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {article.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {article.category && (
                                <>
                                  <Badge variant="outline" className="text-xs">
                                    {article.category?.name}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {article.likes_count ||
                                article.likes?.length ||
                                0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {getViewCount(article.views)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {format(
                              new Date(article.updated_at),
                              "MMM d, yyyy",
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/article/${article.slug}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Preview</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(article)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-destructive"
                                    onClick={() => handleDeleteClick(article)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg. Views per Article
                  </p>
                  <p className="text-2xl font-bold">
                    {articles.length > 0
                      ? Math.round(stats.views / articles.length)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publish Rate</p>
                  <p className="text-2xl font-bold">
                    {articles.length > 0
                      ? Math.round((stats.published / articles.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Article</p>
                  <p className="text-2xl font-bold">
                    {articles.length > 0
                      ? format(new Date(articles[0].created_at), "MMM d")
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Article
            </DialogTitle>
            <DialogDescription>
              Update the article details below. Changes will be saved
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                disabled={submitting}
                className="h-11"
              />
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                rows={10}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                disabled={submitting}
                className="resize-none font-mono text-sm"
              />
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
                disabled={submitting}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="PUBLISHED">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Published
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={submitting}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={submitting}
              className="h-11 gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>Delete Article</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              You're about to delete{" "}
              <span className="font-semibold text-foreground">
                "{selectedArticle?.title}"
              </span>
              . All associated data will be permanently removed.
            </p>
          </div>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel disabled={submitting} className="h-11">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="h-11 bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
