"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CardSwapHero } from "@/components/card-swap-hero";
import { ArticleCard } from "@/components/article-card";
import { SearchBox } from "@/components/search-box";
import {
  getTrendingArticles,
  getAllTags,
  searchAndFilterArticles,
} from "@/lib/search";
import { Navbar } from "@/components/navbar";
import { Article } from "@/lib/types";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
        headers: { Accept: "application/json" },
      });

      const json = await res.json();

      // Make sure we always store an array
      const articleList = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.articles)
        ? json.articles
        : [];

      setArticles(articleList);

      const latestRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/latest`
      );
      const latestJson = await latestRes.json();

      const catRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`
      );
      const catJson = await catRes.json();

      const categoryList = Array.isArray(catJson)
        ? catJson
        : Array.isArray(catJson.data)
        ? catJson.data
        : Array.isArray(catJson.categories)
        ? catJson.categories
        : [];

      setCategories(categoryList);
    };

    fetchData();
  }, []);

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
          new Date(a.published_at || a.created_at).getTime()
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

        <div className="mb-12">
          <SearchBox
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Latest News</h2>
                <Link
                  href="/latest"
                  className="flex items-center gap-2 text-accent"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <section className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Trending</h3>
              <div className="space-y-4">
                {trendingArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex gap-3"
                  >
                    <span className="text-2xl font-bold text-accent">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {article.views?.length || 0} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Browse Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="block px-3 py-2 hover:bg-accent/20"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-bold mb-4">Explore Topics</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag}`}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
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
