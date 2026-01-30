"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { mockCategories } from "@/lib/mock-data";

interface CardSwapHeroProps {
  articles: Article[];
}

export function CardSwapHero({ articles }: CardSwapHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setIsSwapping(false);
      }, 6000);
    }, 6000);

    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const article = articles[currentIndex];
  const nextArticle = articles[(currentIndex + 1) % articles.length];

  const category = mockCategories.find((c) => c.id === article.category_id);
  const nextCategory = mockCategories.find(
    (c) => c.id === nextArticle.category_id,
  );

  const imageUrl = article.thumbnail
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${
        article.thumbnail
      }`
    : "/placeholder.svg";
  return (
    <section className="relative mb-12 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
          <div className="relative w-full h-full">
            {/* Current card */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                isSwapping
                  ? "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <Link
                href={`/article/${article.slug}`}
                className="block h-full group"
              >
                <div className="relative h-full bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-colors">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-md mb-3">
                      {article.category?.name || "News"}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-2">
                      By {article.author?.name || "Staff"} •{" "}
                      {new Date(
                        article.published_at || article.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Next card (below, waiting to swap up) */}
            <div
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                isSwapping
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }`}
            >
              <Link
                href={`/article/${nextArticle.slug}`}
                className="block h-full group"
              >
                <div className="relative h-full bg-card rounded-2xl overflow-hidden border border-border hover:border-primary transition-colors">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-md mb-3">
                      {nextCategory?.name || "News"}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white line-clamp-3">
                      {nextArticle.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-2">
                      By {nextArticle.author?.name || "Staff"} •{" "}
                      {new Date(
                        nextArticle.published_at || nextArticle.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-accent font-bold text-sm uppercase tracking-wide">
              {article.category?.name || "News"}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-balance leading-tight">
              {article.title}
            </h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-6 mt-6 border-t border-border">
            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="leading-tight">
                <p className="text-xl font-semibold">
                  {article.author?.name || "Staff"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(
                    article.published_at || article.created_at,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/article/${article.slug}`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold rounded-xl
               bg-primary text-primary-foreground
               hover:bg-primary/90
               focus:outline-none focus:ring-2 focus:ring-primary/40
               transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Read Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
