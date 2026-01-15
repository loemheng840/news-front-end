import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { TagBadge } from "@/components/tag-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

async function getArticlesByTag(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/tags/${slug}/articles`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.data || [];
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // 🔥 FIX HERE

  const articles = await getArticlesByTag(slug);

  if (!articles) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/tags" className="text-sm text-muted-foreground">
              All Tags
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <TagBadge tag={slug} />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Articles tagged with{" "}
            <span className="text-primary">{slug.replace(/-/g, " ")}</span>
          </h1>

          <p className="text-muted-foreground">
            Found {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center border rounded-lg p-12">
            <p className="text-muted-foreground">No articles yet.</p>
            <Button asChild className="mt-4">
              <Link href="/tags">Back to tags</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
