"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Heart, TrendingUp, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TrendingPage() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/trending`)
      .then((res) => res.json())
      .then((data) => setArticles(data));
  }, []);

  const trendingArticles = [...articles].sort((a, b) => {
    const scoreA =
      a.views + (a.likes_count ?? 0) * 10 + (a.bookmarks_count ?? 0) * 15;
    const scoreB =
      b.views + (b.likes_count ?? 0) * 10 + (b.bookmarks_count ?? 0) * 15;
    return scoreB - scoreA;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 group"
        >
          <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-accent/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trending Now</h1>
            <p className="text-muted-foreground">
              Most viewed and engaged articles
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Articles by Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">
                    <Eye className="h-4 w-4 inline mr-1" /> Views
                  </TableHead>
                  <TableHead className="text-right">
                    <Heart className="h-4 w-4 inline mr-1" /> Likes
                  </TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trendingArticles.map((article, index) => {
                  const score =
                    article.views +
                    (article.likes_count ?? 0) * 10 +
                    (article.bookmarks_count ?? 0) * 15;

                  return (
                    <TableRow key={article.id}>
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          href={`/article/${article.slug}`}
                          className="hover:text-accent"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell>{article.author?.name}</TableCell>
                      <TableCell className="text-right">
                        {article.views}
                      </TableCell>
                      <TableCell className="text-right">
                        {article.likes_count ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-accent/10 text-accent">
                          {score}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
