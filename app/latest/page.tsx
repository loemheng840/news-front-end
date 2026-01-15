"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import type { Article } from "@/lib/types";

export default function LatestPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/articles/latest`,
          { cache: "no-store" }
        );
        const json = await res.json();
        setArticles(json.data || []);
      } catch (e) {
        console.error("Failed to load latest articles", e);
      } finally {
        setLoading(false);
      }
    }

    fetchLatest();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Latest News
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The most recent stories and breaking news from our global newsroom.
          </p>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && articles.length === 0 && (
          <p className="text-red-500">No published articles yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="standard"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
