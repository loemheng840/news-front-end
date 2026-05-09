"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CardSwapHero } from "@/components/card-swap-hero";
import { ArticleCard } from "@/components/article-card";
import { SearchBox } from "@/components/search-box";
import { InfiniteAutoScroll } from "@/components/auto-scoll";
import {
  getTrendingArticles,
  getAllTags,
  searchAndFilterArticles,
} from "@/lib/search";
import { Navbar } from "@/components/navbar";
import { Article } from "@/lib/types";
import {
  useGetArticlesQuery,
  useGetCategoriesQuery,
  useGetFeaturedArticlesQuery,
} from "@/lib/redux/news-api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: articleList = [] } = useGetArticlesQuery();
  const { data: featuredList = [] } = useGetFeaturedArticlesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  const articles = useMemo(() => {
    const merged = [...featuredList, ...articleList];
    const map = new Map<number, Article>();
    merged.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [articleList, featuredList]);

  const featuredArticles = Array.isArray(articles)
    ? articles.filter((a) => a.status === "PUBLISHED").slice(0, 3)
    : [];

  const latestArticles = useMemo(() => {
    if (searchQuery) {
      return searchAndFilterArticles(articles, { query: searchQuery });
    }
    return articles
      .filter((a) => a.status === "PUBLISHED")
      .sort(
        (a, b) =>
          new Date(b.published_at || b.created_at).getTime() -
          new Date(a.published_at || a.created_at).getTime(),
      )
      .slice(0, 6);
  }, [searchQuery, articles]);

  const trendingArticles = getTrendingArticles(articles, 5);
  const popularTags = getAllTags(articles).slice(0, 6);

  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {featuredArticles.length > 0 && (
          <CardSwapHero articles={featuredArticles} />
        )}
        <div className="mt-10">
          <InfiniteAutoScroll />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-12 lg:col-span-2">
            <section className="rounded-xl border bg-card p-5 md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Latest News
                </h2>
                <Link
                  href="/latest"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {latestArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="grid"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold">Trending</h3>
              <div className="space-y-4">
                {trendingArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
                  >
                    <span className="text-2xl font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(typeof article.views === "number"
                          ? article.views
                          : article.views?.length || 0)}{" "}
                        views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold">Browse Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-xl font-bold">Explore Topics</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm transition-colors hover:bg-primary/20"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
