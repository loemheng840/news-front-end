"use client";

import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { useGetLatestArticlesQuery } from "@/lib/redux/news-api";

export default function LatestPage() {
  const { data, isLoading } = useGetLatestArticlesQuery();
  const articles = data?.data ?? [];

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

        {isLoading && <p>Loading...</p>}

        {!isLoading && articles.length === 0 && (
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
