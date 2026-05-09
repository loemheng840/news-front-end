import type { Article, Category, Comment, Tag, User } from "@/lib/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const apiRoutes = {
  login: "/login",
  register: "/register",
  logout: "/logout",
  me: "/me",

  articles: "/articles",
  latestArticles: "/articles/latest",
  trendingArticles: "/articles/trending",
  featuredArticles: "/articles/featured",
  searchArticles: "/articles/search",
  articlesByDate: "/articles/date",
  articleByCategory: (slug: string) => `/articles/category/${slug}`,
  articleByTag: (slug: string) => `/articles/tag/${slug}`,
  articleRelated: (idOrSlug: string | number) => `/articles/${idOrSlug}/related`,
  articleComments: (idOrSlug: string | number) =>
    `/articles/${idOrSlug}/comments`,
  articleCommentReplies: (articleId: string | number, parentId: string | number) =>
    `/articles/${articleId}/comments/${parentId}/replies`,
  myArticles: "/articles/me",
  editorArticles: "/editor/articles",
  adminArticles: "/articles/admin",
  articleSubmit: (id: string | number) => `/articles/${id}/submit`,
  articleMeta: (id: string | number) => `/articles/${id}/meta`,
  articleLike: (id: string | number) => `/articles/${id}/like`,
  articleBookmark: (id: string | number) => `/articles/${id}/bookmark`,
  articleView: (id: string | number) => `/articles/${id}/view`,

  categories: "/categories",
  categoryBySlug: (slug: string) => `/categories/${slug}`,
  categoryArticles: (slug: string) => `/categories/${slug}/articles`,

  tags: "/tags",
  tagArticles: (slug: string) => `/tags/${slug}/articles`,

  bookmarks: "/me/bookmarks",
  users: "/users",

  comments: "/comments",
  commentReplies: (commentId: string | number) => `/comments/${commentId}/replies`,
  commentLike: (commentId: string | number) => `/comments/${commentId}/like`,
  moderateComment: (commentId: string | number) =>
    `/comments/${commentId}/moderate`,
};

export function buildApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.articles)) return record.articles as T[];
    if (Array.isArray(record.categories)) return record.categories as T[];
    if (Array.isArray(record.tags)) return record.tags as T[];
  }
  return [];
}

export function extractEntity<T>(payload: unknown, key?: string): T {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (key && record[key] !== undefined) return record[key] as T;
    if (record.data && !Array.isArray(record.data)) return record.data as T;
  }
  return payload as T;
}

export function extractPaginatedData<T>(payload: unknown) {
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown[] }).data)) {
    return payload as {
      current_page?: number;
      data: T[];
      last_page?: number;
      per_page?: number;
      total?: number;
    };
  }

  return {
    data: extractArray<T>(payload),
    current_page: 1,
    last_page: 1,
    per_page: extractArray<T>(payload).length,
    total: extractArray<T>(payload).length,
  };
}

export function extractBookmarkArticles(payload: unknown): Article[] {
  return extractArray<{ article?: Article } | Article>(payload)
    .map((item) =>
      item && typeof item === "object" && "article" in item ? item.article : item,
    )
    .filter(Boolean) as Article[];
}

export type NewsListPayload =
  | Article[]
  | Category[]
  | Tag[]
  | Comment[]
  | User[];
