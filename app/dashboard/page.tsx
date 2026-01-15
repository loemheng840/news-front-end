"use client";

import { useEffect, useState } from "react";
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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboardPage() {
  const { user, isLoading, token } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!user) return;
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
      setLoading(false);
    }
  };

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
      const res = await fetch(`${API}/articles/${selectedArticle.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update article");
      }

      setSuccess("Article updated successfully");
      setEditDialogOpen(false);
      loadArticles();
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
      const res = await fetch(`${API}/articles/${selectedArticle.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete article");
      }

      setSuccess("Article deleted successfully");
      setDeleteDialogOpen(false);
      loadArticles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete article");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) return null;
  if (!user || user.role !== "ADMIN") redirect("/");

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    views: articles.reduce((sum, a) => sum + (a.views || 0), 0),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "DRAFT":
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage all articles in the system.
            </p>
          </div>

          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="mr-2 h-4 w-4" /> New Article
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Articles", value: stats.total, icon: FileText },
            { label: "Published", value: stats.published, icon: CheckCircle2 },
            { label: "Drafts", value: stats.drafts, icon: FileText },
            { label: "Total Views", value: stats.views, icon: Eye },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>
              View and manage all published and draft content.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {articles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No articles found. Create your first article to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        {article.title}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{article.author?.name}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary">
                          {article.category?.name}
                        </Badge>
                      </TableCell>

                      <TableCell className="flex items-center gap-2">
                        {getStatusIcon(article.status)}
                        {article.status}
                      </TableCell>

                      <TableCell>
                        {article.likes_count ?? article.likes?.length ?? 0}
                      </TableCell>
                      <TableCell>{article.views ?? 0}</TableCell>

                      <TableCell>
                        {format(new Date(article.created_at), "MMM d, yyyy")}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/article/${article.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(article)}
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
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Make changes to your article here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                rows={8}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
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
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              article "{selectedArticle?.title}" and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
