"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { fetchBookmarks } from "@/lib/api";
import type { Article } from "@/lib/types";

export default function SavedArticlesPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!token) return;

    async function load() {
      try {
        const data = await fetchBookmarks(token);
        setArticles(data);
      } catch (e) {
        console.error("Failed to load bookmarks", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, token, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 group"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="mb-12 flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Bookmark className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Saved Articles</h1>
            <p className="text-muted-foreground">
              Your personal collection of bookmarked stories
            </p>
          </div>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && articles.length === 0 && (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No saved articles yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start bookmarking articles to build your reading list
            </p>
            <Button asChild>
              <Link href="/">Explore Articles</Link>
            </Button>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="standard"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
