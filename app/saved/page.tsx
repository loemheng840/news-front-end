"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, ChevronLeft } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import {
  useGetBookmarksQuery,
  useUnbookmarkArticleMutation,
} from "@/lib/redux/news-api";

export default function SavedArticlesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: articles = [], isLoading } = useGetBookmarksQuery(undefined, {
    skip: !user,
  });
  const [unbookmarkArticle] = useUnbookmarkArticleMutation();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  const removeBookmark = async (articleId: number) => {
    try {
      await unbookmarkArticle(articleId).unwrap();
    } catch (err) {
      console.error("Failed to remove bookmark", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary group"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <Bookmark className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Saved Articles</h1>
            <p className="text-muted-foreground">
              Your personal collection of bookmarked stories
            </p>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading...</p>}

        {!isLoading && articles.length === 0 && (
          <div className="py-16 text-center">
            <Bookmark className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold">
              No saved articles yet
            </h2>
            <p className="mb-6 text-muted-foreground">
              Start bookmarking articles to build your reading list
            </p>
            <Button asChild>
              <Link href="/">Explore Articles</Link>
            </Button>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div key={article.id} className="relative">
                <ArticleCard article={article} variant="standard" />

                <button
                  onClick={() => removeBookmark(article.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background shadow text-accent hover:scale-105 transition"
                  title="Remove bookmark"
                >
                  <Bookmark className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
