"use client";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/tag-badge";
import { Bookmark, Calendar, Eye, Heart, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  useBookmarkArticleMutation,
  useUnbookmarkArticleMutation,
} from "@/lib/redux/news-api";

interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "standard" | "compact" | "grid";
}

export function ArticleCard({
  article,
  variant = "standard",
}: ArticleCardProps) {
  const author = article.author;
  const category = article.category;
  const viewCount =
    typeof article.views === "number" ? article.views : article.views?.length || 0;

  const formattedDate = article.published_at
    ? format(new Date(article.published_at), "MMM dd, yyyy")
    : format(new Date(article.created_at), "MMM dd, yyyy");

  const imageUrl = article.thumbnail
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${article.thumbnail
    }`
    : "/placeholder.svg";

  const authorAvatarUrl = author?.avatar
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${author.avatar}`
    : "/placeholder-user.jpg";

  const [saved, setSaved] = useState(article.bookmarks || false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [unbookmarkArticle] = useUnbookmarkArticleMutation();

  const toggleBookmark = async () => {
    if (isBookmarking) return;

    setIsBookmarking(true);

    try {
      if (saved) {
        await unbookmarkArticle(article.id).unwrap();
      } else {
        await bookmarkArticle(article.id).unwrap();
      }
      setSaved(!saved);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsBookmarking(false);
    }
  };

  if (variant === "featured") {
    return (
      <article className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-video md:aspect-auto h-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Floating Badge */}
            <Badge className="absolute top-6 left-6 bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg border-0 px-4 py-1.5">
              {article.category?.name}
            </Badge>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-5">
            {/* Meta Info */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />5 min read
              </span>
            </div>

            {/* Title */}
            <Link href={`/article/${article.slug}`}>
              <h2 className="text-2xl md:text-4xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-3">
                {article.title}
              </h2>
            </Link>

            {/* Excerpt */}
            <p className="text-muted-foreground line-clamp-3 leading-relaxed">
              {article.content.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 180)}...
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 mt-auto">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full bg-muted overflow-hidden ring-2 ring-background shadow-sm">
                  <Image
                    src={authorAvatarUrl}
                    alt={author?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{author?.name}</span>
                  <span className="text-xs text-muted-foreground">Author</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Eye className="h-4 w-4" />
                  {viewCount}
                </span>
                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                  <Heart className="h-4 w-4" />
                  {article.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group flex gap-4 items-start p-3 rounded-lg hover:bg-accent/5 transition-colors duration-200">
        <Link href={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="relative h-24 w-28 overflow-hidden rounded-lg border shadow-sm">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </Link>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0.5">
            {article.category?.name}
          </Badge>

          <Link href={`/article/${article.slug}`}>
            <h4 className="font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h4>
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{formattedDate}</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "grid") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full">
        {/* Image */}
        <Link href={`/article/${article.slug}`} className="relative">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg border-0">
              {article.category?.name}
            </Badge>

            {/* Bookmark Button - Overlay */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark();
              }}
              disabled={isBookmarking}
              className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${saved
                  ? "bg-primary text-primary-foreground shadow-lg scale-100"
                  : "bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100"
                }`}
            >
              <Bookmark
                className="w-4 h-4"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </Link>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
            {article.content.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 140)}...
          </p>

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag.id} tag={tag.name} className="text-xs" />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-4 border-t space-y-3">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 rounded-full bg-muted overflow-hidden">
                <Image
                  src={authorAvatarUrl}
                  alt={author?.name || ""}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-medium">
                {article.author?.name}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Eye className="h-3 w-3" />
                  {viewCount}
                </span>
                <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart className="h-3 w-3" />
                  {article.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard variant
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300">
      {/* Image */}
      <Link href={`/article/${article.slug}`} className="relative">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-md border-0">
            {category?.name}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/article/${article.slug}`}>
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {article.content.slice(0, 150).replace(/<\/?[^>]+(>|$)/g, "")}...
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full bg-muted overflow-hidden">
              <Image
                src={authorAvatarUrl}
                alt={author?.name || ""}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">{author?.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" />
              {viewCount}
            </span>
            <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Heart className="h-3.5 w-3.5" />
              {article.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
