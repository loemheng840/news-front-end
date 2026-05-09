"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import {
  useGetCategoryArticlesQuery,
  useGetCategoryBySlugQuery,
} from "@/lib/redux/news-api";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: category, isLoading: isCategoryLoading } = useGetCategoryBySlugQuery(
    slug,
    { skip: !slug },
  );
  const { data: articlesData, isLoading: isArticlesLoading } =
    useGetCategoryArticlesQuery(slug, { skip: !slug });
  const articles = articlesData?.data ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold mb-8">
            {isCategoryLoading ? "Loading..." : category?.name ?? "Category"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The most recent stories and breaking news from our global newsroom.
          </p>
        </div>
        {isArticlesLoading ? (
          <p>Loading articles...</p>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        ) : (
          <p>No articles in this category.</p>
        )}
      </main>
    </div>
  );
}
