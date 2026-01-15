"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import ArticleDetailClient from "@/components/article-detail-client";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const imageUrl = article?.thumbnail
    ? `${API?.replace("/api", "")}/storage/${article.thumbnail}`
    : "/placeholder.svg";

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const articleRes = await fetch(`${API}/articles/${slug}`);
      const articleData = await articleRes.json();
      setArticle(articleData);

      const commentsRes = await fetch(
        `${API}/articles/${articleData.id}/comments`
      );
      const commentsData = await commentsRes.json();
      setComments(commentsData);

      // Count view
      await fetch(`${API}/articles/${articleData.id}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    };

    fetchData();
  }, [slug]);

  if (!article) return <p className="p-10">Loading...</p>;

  return (
    <>
      <Navbar />

      <ArticleDetailClient
        article={article}
        author={article.author}
        category={article.category}
        comments={comments}
        relatedArticles={[]}
      />
    </>
  );
}
