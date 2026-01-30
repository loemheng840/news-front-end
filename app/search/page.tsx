"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"date" | "views">("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((j) => setCategories(j.data || j));
    fetch(`${API}/tags`)
      .then((r) => r.json())
      .then((j) => setTags(j.data || j));
  }, []);

  useEffect(() => {
    loadArticles();
  }, [q, activeCategory, activeTag, from, to, sort]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let url = `${API}/articles/latest`;

      if (q) url = `${API}/articles/search?q=${q}`;
      if (activeCategory) url = `${API}/categories/${activeCategory}/articles`;
      if (activeTag) url = `${API}/tags/${activeTag}/articles`;
      if (from && to) url = `${API}/articles/date?from=${from}&to=${to}`;

      const res = await fetch(url);
      const json = await res.json();
      let data = json.data || json;

      if (sort === "views") {
        data = data.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
      } else {
        data = data.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      }

      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-2">
        {q ? `Search "${q}"` : "Browse Articles"}
      </h1>
      <p className="text-muted-foreground mb-6">
        {articles.length} articles found
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" /> Sort
          </h3>

          <Button
            variant={sort === "date" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSort("date")}
          >
            Newest
          </Button>

          <Button
            variant={sort === "views" ? "default" : "outline"}
            className="w-full"
            onClick={() => setSort("views")}
          >
            Most Viewed
          </Button>

          <div>
            <h4 className="font-semibold mb-2">Categories</h4>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setActiveTag("");
                }}
                className={`block w-full text-left px-3 py-2 rounded ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setActiveTag(tag.slug);
                    setActiveCategory("");
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeTag === tag.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Date Range</h4>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-2"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setActiveCategory("");
              setActiveTag("");
              setFrom("");
              setTo("");
            }}
          >
            Clear Filters
          </Button>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <p>Loading...</p>
          ) : articles.length ? (
            <div className="grid gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No articles found.
            </div>
          )}
        </div>
      </div>
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
