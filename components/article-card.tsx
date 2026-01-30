"use client";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TagBadge } from "@/components/tag-badge";
import { Bookmark, Calendar, Eye, Heart } from "lucide-react";
import { format } from "date-fns";
interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "standard" | "compact" | "grid";
}
import { useState } from "react";

export function ArticleCard({
  article,
  variant = "standard",
}: ArticleCardProps) {
  const author = article.author;
  const category = article.category;

  const formattedDate = article.published_at
    ? format(new Date(article.published_at), "MMM dd, yyyy")
    : format(new Date(article.created_at), "MMM dd, yyyy");

  const imageUrl = article.thumbnail
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${
        article.thumbnail
      }`
    : "/placeholder.svg";

  const [saved, setSaved] = useState(article.bookmarks || false);

  const toggleBookmark = async () => {
    const method = saved ? "DELETE" : "POST";

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/${article.id}/bookmark`,
      {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    setSaved(!saved);
  };

  if (variant === "featured") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group block relative overflow-hidden rounded-2xl border bg-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative aspect-video md:aspect-auto h-full">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant="secondary"
                className="bg-accent/10 text-accent border-accent/20"
              >
                {article.category?.name}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formattedDate}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
              {article.title}
            </h3>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted relative overflow-hidden">
                  <Image
                    src={author?.avatar || ""}
                    alt={author?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">{author?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {article.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {article.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        className="group flex gap-4 items-start"
      >
        <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-accent">
            {article.category?.name}
          </span>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h4>
          <span className="text-[10px] text-muted-foreground uppercase">
            {formattedDate}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <div className="group block overflow-hidden rounded-xl border bg-card hover:shadow-lg hover:border-primary transition-all duration-300">
        {/* Image */}
        <Link href={`/article/${article.slug}`}>
          <div className="relative aspect-video">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              {article.category?.name}
            </Badge>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 flex flex-col h-full">
          <Link href={`/article/${article.slug}`}>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.content.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 120)}...
          </p>

          {article.tags?.toString() !== "0" && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags?.slice(0, 2).map((tag) => (
                <TagBadge key={tag.id} tag={tag.name} className="text-xs" />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-3">
            <Link
              href={`/article/${article.slug}`}
              className="text-sm text-accent"
            >
              Read more
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark();
              }}
              className={`p-2 rounded-full transition ${
                saved ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <Bookmark
                className="w-5 h-5"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {article.author?.name}
            </span>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {article.views?.length || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {article.likes?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all"
    >
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-4 left-4" variant="secondary">
          {category?.name}
        </Badge>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {article.content.slice(0, 100).replace(/<\/?[^>]+(>|$)/g, "")}...
        </p>
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{author?.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {article.views?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {article.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
