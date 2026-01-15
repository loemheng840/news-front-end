// search category only

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type { Article } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/search?q=${query}`
      );
      const json = await res.json();
      setArticles(json.data || []);
      setLoading(false);
    }

    fetchSearch();
  }, [query]);

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : "Search Articles"}
        </h1>
        <p className="text-muted-foreground">
          {articles.length} result{articles.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="grid" />
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-16 border rounded-lg">
          <p className="text-lg font-medium">No articles found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (location.href = "/")}
          >
            Back to Home
          </Button>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={null}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
