import { Navbar } from "@/components/navbar";
import { ArticleCard } from "@/components/article-card";
import { notFound } from "next/navigation";

async function getCategory(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

async function getArticles(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}/articles`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>; // 👈 Promise
}) {
  const { slug } = await params; // 👈 MUST await

  const category = await getCategory(slug);
  if (!category) notFound();

  const articles = await getArticles(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold mb-8">{category.name}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            The most recent stories and breaking news from our global newsroom.
          </p>
        </div>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any) => (
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
