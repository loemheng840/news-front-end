"use client"

import Link from "next/link"
import { getTrendingArticles } from "@/lib/search"
import type { Article } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Eye } from "lucide-react"

interface TrendingSectionProps {
  articles: Article[]
  limit?: number
}

export function TrendingSection({ articles, limit = 5 }: TrendingSectionProps) {
  const trendingArticles = getTrendingArticles(articles, limit)

  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-bold">Trending Now</h2>
      </div>

      <div className="space-y-4">
        {trendingArticles.map((article, index) => (
          <Link key={article.id} href={`/article/${article.slug}`} className="group block">
            <div className="flex gap-4 pb-4 border-b last:border-b-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    {article.views.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
