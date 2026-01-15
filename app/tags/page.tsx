import { Navbar } from "@/components/navbar";
import { Hash } from "lucide-react";
import Link from "next/link";

async function getTags() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags`, {
    cache: "no-store",
  });
  const json = await res.json();
  return json.data || [];
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-accent" />
            <h1 className="text-4xl font-bold">Browse by Tags</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore articles by topic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag: any) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="group rounded-lg border bg-card p-6 hover:border-primary hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold capitalize">{tag.name}</h3>
                <span className="text-xs bg-accent/20 px-2 py-1 rounded-full">
                  {tag.articles_count || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {tag.articles_count || 0} articles
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
