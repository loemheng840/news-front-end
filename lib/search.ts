import type { Article } from "./types";

export interface SearchFilters {
  query?: string;
  tags?: string[];
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "views" | "trending";
}

export function searchAndFilterArticles(
  articles: Article[],
  filters: SearchFilters
): Article[] {
  let results = articles.filter((article) => article.status === "PUBLISHED");

  if (filters.query) {
    const query = filters.query.toLowerCase();
    results = results.filter((article) =>
      article.title.toLowerCase().includes(query)
    );
  }

  if (filters.categoryId && filters.categoryId > 0) {
    results = results.filter(
      (article) => article.category?.id === filters.categoryId
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((article) =>
      article.tags?.some((tag) =>
        filters.tags!.includes(tag.name.toLowerCase())
      )
    );
  }

  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    results = results.filter(
      (article) =>
        new Date(article.published_at || article.created_at) >= startDate
    );
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
    results = results.filter(
      (article) =>
        new Date(article.published_at || article.created_at) <= endDate
    );
  }

  // if (filters.sortBy === "views") {
  //   results.sort((a, b) => (b.views || 0) - (a.views || 0));
  // } else if (filters.sortBy === "trending") {
  //   results.sort((a, b) => {
  //     const aScore = (a.views || 0) + (a.likes_count || 0) * 10;
  //     const bScore = (b.views || 0) + (b.likes_count || 0) * 10;
  //     return (
  //       bScore - aScore ||
  //       new Date(b.published_at || b.created_at).getTime() -
  //         new Date(a.published_at || a.created_at).getTime()
  //     );
  //   });
  // } else {
  //   results.sort(
  //     (a, b) =>
  //       new Date(b.published_at || b.created_at).getTime() -
  //       new Date(a.published_at || a.created_at).getTime()
  //   );
  // }

  return results;
}

export function getTrendingArticles(articles: Article[], limit = 5): Article[] {
  return searchAndFilterArticles(articles, { sortBy: "trending" }).slice(
    0,
    limit
  );
}

export function getAllTags(articles: Article[]): string[] {
  const tagSet = new Set<string>();

  articles.forEach((article) => {
    article.tags?.forEach((tag) => tagSet.add(tag.name));
  });

  return Array.from(tagSet).sort();
}

export function getArticlesByTag(
  articles: Article[],
  tagName: string
): Article[] {
  return articles
    .filter(
      (article) =>
        article.status === "PUBLISHED" &&
        article.tags?.some(
          (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
        )
    )
    .sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    );
}
export async function apiFetch(url: string, token?: string, options: any = {}) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "application/json",
      ...options.headers,
    },
  });
}
