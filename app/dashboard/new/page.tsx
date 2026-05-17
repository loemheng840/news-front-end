"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  X,
  FileText,
  Tag,
  Image,
  Save,
  Send,
  Plus,
  FolderPlus,
  Hash,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LayoutTemplate,
  Palette,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  useCreateArticleMutation,
  useCreateCategoryMutation,
  useCreateTagMutation,
  useGetCategoriesQuery,
  useGetTagsQuery,
} from "@/lib/redux/news-api";

export default function NewArticlePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<number[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState("content");

  // Dialogs state
  const [newTagDialog, setNewTagDialog] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: allTags = [] } = useGetTagsQuery();
  const [createTag] = useCreateTagMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [createArticle] = useCreateArticleMutation();

  useEffect(() => {
    setCharacterCount(content.length);
    setWordCount(
      content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
    );
  }, [content]);

  if (!user || user.role === "READER") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to create articles
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canManageTaxonomy = user.role === "ADMIN";

  const toggleTag = (id: number) => {
    setTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleCreateTag = async () => {
    if (!canManageTaxonomy) {
      toast.error("Only admins can create tags");
      return;
    }
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setCreatingTag(true);
    try {
      const createdTag = await createTag({ name: newTagName.trim() }).unwrap();
      setTags((prev) => [...prev, createdTag.id]);
      setNewTagName("");
      setNewTagDialog(false);
      toast.success(`Tag "${createdTag.name}" created successfully`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!canManageTaxonomy) {
      toast.error("Only admins can create categories");
      return;
    }
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setCreatingCategory(true);
    try {
      const createdCategory = await createCategory({
        name: newCategoryName.trim(),
      }).unwrap();
      setCategoryId(createdCategory.id.toString());
      setNewCategoryName("");
      setNewCategoryDialog(false);
      toast.success(`Category "${createdCategory.name}" created successfully`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (publishStatus: "PUBLISHED" | "DRAFT") => {
    if (!title.trim() || !content.trim() || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await createArticle({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category_id: Number(categoryId),
        status: publishStatus,
        featured,
        thumbnail,
        tag_ids: tags,
      }).unwrap();
      toast.success(
        publishStatus === "PUBLISHED"
          ? "Article published successfully!"
          : "Article saved as draft!",
      );
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Create New Article
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Share your knowledge and insights with the world
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {user.role === "ADMIN" ? "Administrator" : "Author"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Card */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>Content</CardTitle>
                        <CardDescription>
                          Write your main article content
                        </CardDescription>
                      </div>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsContent value="content" className="space-y-6">
                      {/* Title */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="Catchy title that grabs attention..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-12 text-lg border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>

                      {/* Excerpt */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Excerpt (Optional)
                        </Label>
                        <Textarea
                          placeholder="Brief summary of your article..."
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          className="min-h-[100px] border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {excerpt.length}/200 characters
                        </p>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Content <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{wordCount} words</span>
                            <span>{characterCount} characters</span>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Start writing your amazing content here..."
                          className="min-h-[400px] font-mono text-sm leading-relaxed border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="prose prose-lg dark:prose-invert max-w-none p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 min-h-[400px]">
                        {content ? (
                          <div>
                            <h1 className="text-3xl font-bold mb-4">{title}</h1>
                            {excerpt && (
                              <div className="text-gray-600 dark:text-gray-400 italic mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                {excerpt}
                              </div>
                            )}
                            <div className="whitespace-pre-wrap">{content}</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                            <p>No content to preview</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Thumbnail Card */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Image className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Thumbnail</CardTitle>
                      <CardDescription>
                        Upload a featured image for your article
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {thumbnailPreview ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={removeThumbnail}
                            className="absolute top-4 right-4"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click image to change
                        </p>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all duration-200 group">
                          <div className="flex flex-col items-center justify-center p-8">
                            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                              <Upload className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Upload Thumbnail
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              Drag & drop or click to browse
                              <br />
                              Recommended: 1200×630px, max 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
              {/* Publish Card */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-lg sticky top-8">
                <CardHeader className="border-b bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <Send className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Publish Settings</CardTitle>
                      <CardDescription>
                        Configure your article settings
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={status === "DRAFT" ? "default" : "outline"}
                        onClick={() => setStatus("DRAFT")}
                        className="h-11 justify-start gap-3"
                      >
                        <EyeOff className="h-4 w-4" />
                        Draft
                      </Button>
                      <Button
                        type="button"
                        variant={status === "PUBLISHED" ? "default" : "outline"}
                        onClick={() => setStatus("PUBLISHED")}
                        className="h-11 justify-start gap-3"
                      >
                        <Globe className="h-4 w-4" />
                        Published
                      </Button>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      {canManageTaxonomy && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewCategoryDialog(true)}
                          className="h-7 text-xs gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          New
                        </Button>
                      )}
                    </div>
                    <Select
                      value={categoryId}
                      onValueChange={setCategoryId}
                      required
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            <div className="flex items-center gap-2">
                              <FolderPlus className="h-4 w-4 text-gray-500" />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags ({tags.length} selected)
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTags([])}
                          className="h-7 text-xs"
                        >
                          Clear all
                        </Button>
                        {canManageTaxonomy && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewTagDialog(true)}
                            className="h-7 text-xs gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            New
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-h-48 overflow-y-auto">
                      {allTags.length > 0 ? (
                        allTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={
                              tags.includes(tag.id) ? "default" : "outline"
                            }
                            className="cursor-pointer transition-all hover:scale-105 gap-1.5"
                            onClick={() => toggleTag(tag.id)}
                          >
                            <Hash className="h-3 w-3" />
                            {tag.name}
                            {tags.includes(tag.id) && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No tags available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                        <Star className="h-4 w-4" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured Article
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Highlight this article
                        </p>
                      </div>
                    </div>
                    <Switch checked={featured} onCheckedChange={setFeatured} />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t">
                    <Button
                      type="button"
                      onClick={() => handleSubmit(status)}
                      disabled={
                        loading ||
                        !title.trim() ||
                        !content.trim() ||
                        !categoryId
                      }
                      className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {status === "PUBLISHED"
                            ? "Publishing..."
                            : "Saving..."}
                        </>
                      ) : status === "PUBLISHED" ? (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Publish Now
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save as Public
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      disabled={loading}
                      className="w-full h-11"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {wordCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Words
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {characterCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Characters
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-lg bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" />
                    Writing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      icon: <FileText className="h-4 w-4" />,
                      title: "Catchy Title",
                      desc: "Make your title specific and intriguing",
                    },
                    {
                      icon: <LayoutTemplate className="h-4 w-4" />,
                      title: "Clear Structure",
                      desc: "Use headings and paragraphs",
                    },
                    {
                      icon: <Palette className="h-4 w-4" />,
                      title: "Engaging Content",
                      desc: "Add images and examples",
                    },
                    {
                      icon: <Clock className="h-4 w-4" />,
                      title: "Optimal Length",
                      desc: "Aim for 1000-2000 words",
                    },
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/30 rounded-lg"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {tip.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {tip.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={newTagDialog} onOpenChange={setNewTagDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Create New Tag
            </DialogTitle>
            <DialogDescription>
              Add a new tag to categorize your content
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name (e.g., Technology)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                disabled={creatingTag}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewTagDialog(false);
                setNewTagName("");
              }}
              disabled={creatingTag}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={creatingTag || !newTagName.trim()}
            >
              {creatingTag && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Category
            </DialogTitle>
            <DialogDescription>
              Add a new category to organize your content
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Enter category name (e.g., Sports)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={creatingCategory}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewCategoryDialog(false);
                setNewCategoryName("");
              }}
              disabled={creatingCategory}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
            >
              {creatingCategory && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Star icon component
function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
