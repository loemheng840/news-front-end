"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import ArticleDetailClient from "@/components/article-detail-client";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  useGetArticleBySlugQuery,
  useGetRelatedArticlesQuery,
} from "@/lib/redux/news-api";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useGetArticleBySlugQuery(slug, {
    skip: !slug,
  });
  const { data: relatedList = [] } = useGetRelatedArticlesQuery(article?.id ?? "", {
    skip: !article?.id,
  });
  const related = relatedList.filter((item) => item.slug !== slug).slice(0, 4);

  if (isLoading || !article) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading article...</div>
        </div>
      </>
    );
  }

  const getImageUrl = (thumbnail?: string | null) => {
    if (!thumbnail) return "/placeholder.svg";
    if (thumbnail.startsWith("http")) return thumbnail;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${thumbnail}`;
  };

  return (
    <>
      <Navbar />
      <ArticleDetailClient article={article} />

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/article/${item.slug}`}
                className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={getImageUrl(item.thumbnail)}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-xs font-medium text-primary mb-1">
                    {item.category?.name}
                  </span>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.published_at
                      ? format(new Date(item.published_at), "MMM d, yyyy")
                      : format(new Date(item.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
