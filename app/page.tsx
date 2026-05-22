"use client";

import { useState, useMemo } from "react";
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
import {
  useGetArticlesQuery,
  useGetCategoriesQuery,
  useGetFeaturedArticlesQuery,
} from "@/lib/redux/news-api";
import { TestimonialsColumn } from "@/components/blocks/testimonials-columns-1";

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
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-12 lg:col-span-2 rounded-3xl border bg-background/80">
            <section className="p-5 md:p-6">
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
          <div className="space-y-6">
            {/* Trending */}
            <section className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">Trending</h3>

                <Link
                  href="/trending"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {trendingArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="group flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all hover:border-border hover:bg-muted/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-5 transition-colors group-hover:text-primary">
                        {article.title}
                      </h4>

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {(typeof article.views === "number"
                            ? article.views
                            : article.views?.length || 0)
                            .toLocaleString()}{" "}
                          views
                        </span>

                        <span>•</span>

                        <span>Trending now</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Categories */}
            <section className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">
                  Browse Categories
                </h3>

                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Explore
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>

                      <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Topics */}
            <section className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">
                  Explore Topics
                </h3>

                <Link
                  href="/topics"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  More topics
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag}`}
                    className="rounded-full border bg-muted/40 px-4 py-2 text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          </div>
          </div>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl text-center">
            What Our Readers Say
          </h2>
          <TestimonialsColumn testimonials={[
            {
              text: "This news platform is my daily source of truth. Highly recommended!",
              image: "https://i.pravatar.cc/150?img=1",
              name: "Alex Johnson",
              role: "Tech Enthusiast"
            },
            {
              text: "I love the clean design and the speed of updates.",
              image: "https://i.pravatar.cc/150?img=2",
              name: "Sarah Williams",
              role: "Product Manager"
            },
            {
              text: "The best place to get accurate and fast breaking news.",
              image: "https://i.pravatar.cc/150?img=3",
              name: "Michael Chen",
              role: "Journalist"
            },
            {
              text: "An incredibly well-designed UI. It's a joy to read.",
              image: "https://i.pravatar.cc/150?img=4",
              name: "Emma Davis",
              role: "Designer"
            }
          ]} />
        </section>
      </main>
    </>
  );
}
