"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
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
import { Upload, X, FileText, Tag, Image, Save, Send } from "lucide-react";

export default function NewArticlePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<number[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"public" | "draft">("public");

  const [categories, setCategories] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || data));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags`)
      .then((res) => res.json())
      .then((data) => setAllTags(data.data || data));
  }, []);

  if (!user || user.role === "READER") return null;

  const toggleTag = (id: number) => {
    setTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSubmit = async (status: "public" | "draft") => {
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category_id", categoryId);
    formData.append("status", status === "public" ? "PUBLISHED" : "DRAFT");
    if (thumbnail) formData.append("thumbnail", thumbnail);
    tags.forEach((id) => formData.append("tag_ids[]", id.toString()));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Create article failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Create New Article
            </h1>
            <p className="text-slate-600">Share your thoughts with the world</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Title Section */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FileText className="w-4 h-4" />
                  Article Title
                </label>
                <Input
                  placeholder="Enter an engaging title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Category
                </label>
                <Select onValueChange={setCategoryId} required>
                  <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Content
                </label>
                <Textarea
                  placeholder="Write your article content here..."
                  className="min-h-[300px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-base leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-500">
                  {content.length} characters
                </p>
              </div>

              {/* Thumbnail Section */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Image className="w-4 h-4" />
                  Thumbnail Image
                </label>

                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-sm text-slate-600 font-medium">
                        Click to upload thumbnail
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Tag className="w-4 h-4" />
                  Tags ({tags.length} selected)
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          tags.includes(tag.id)
                            ? "bg-blue-500 text-white shadow-md scale-105"
                            : "bg-white text-slate-700 border border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No tags available</p>
                  )}
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 h-12 text-base"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-12 text-base border-slate-300 hover:bg-slate-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save as Draft
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("public")}
                  disabled={loading}
                  className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Publishing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Publish Now
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
