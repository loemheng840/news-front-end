"use client";

import { useEffect, useState } from "react";
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
import {
  useDeleteArticleMutation,
  useGetEditorArticlesQuery,
  useUpdateArticleMutation,
} from "@/lib/redux/news-api";

export default function AuthDashboardPage() {
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
  const {
    data: articles = [],
    isLoading: loading,
    refetch: refetchArticles,
  } = useGetEditorArticlesQuery(undefined, {
    skip: !user || (user.role !== "ADMIN" && user.role !== "AUTHOR"),
  });
  const [updateArticleMutation] = useUpdateArticleMutation();
  const [deleteArticleMutation] = useDeleteArticleMutation();
  const getViewCount = (views: any) =>
    typeof views === "number" ? views : Array.isArray(views) ? views.length : 0;

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

  if (isLoading || loading) return null;
  if (!user || (user.role !== "ADMIN" && user.role !== "AUTHOR")) redirect("/");

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "PUBLISHED").length,
    drafts: articles.filter((a) => a.status === "DRAFT").length,
    views: articles.reduce((sum, a) => sum + getViewCount(a.views), 0),
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
      <main className="flex-1 container mx-auto">
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
                      <TableCell>{getViewCount(article.views)}</TableCell>

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
