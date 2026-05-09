"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import ArticleDetailClient from "@/components/article-detail-client";
import Link from "next/link";
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

  if (isLoading || !article) return <p className="p-10">Loading...</p>;

  return (
    <>
      <Navbar />
      <ArticleDetailClient article={article} />
      {related.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <h2 className="mb-4 text-2xl font-bold">Related Articles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/article/${item.slug}`}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/40"
              >
                <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
