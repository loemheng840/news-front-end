import type { Article, Category, Comment, Tag, User } from "@/lib/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const apiRoutes = {
  // Auth
  login: "/login",
  register: "/register",
  logout: "/logout",
  me: "/me",

  // Articles
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
  articleRestore: (id: string | number) => `/articles/${id}/restore`,

  // Article Revisions
  articleRevisions: (articleId: string | number) => `/articles/${articleId}/revisions`,
  articleRevision: (articleId: string | number, version: number) =>
    `/articles/${articleId}/revisions/${version}`,

  // SEO Meta
  articleSeo: (articleId: string | number) => `/articles/${articleId}/seo`,

  // Categories
  categories: "/categories",
  categoryBySlug: (slug: string) => `/categories/${slug}`,
  categoryArticles: (slug: string) => `/categories/${slug}/articles`,

  // Tags
  tags: "/tags",
  tagArticles: (slug: string) => `/tags/${slug}/articles`,

  // Bookmarks
  bookmarks: "/me/bookmarks",

  // Users
  users: "/users",
  userProfile: (id: string | number) => `/users/${id}/profile`,

  // Profile
  profile: "/profile",

  // Comments
  comments: "/comments",
  commentReplies: (commentId: string | number) => `/comments/${commentId}/replies`,
  commentLike: (commentId: string | number) => `/comments/${commentId}/like`,
  commentReact: (commentId: string | number) => `/comments/${commentId}/react`,
  commentReactions: (commentId: string | number) => `/comments/${commentId}/reactions`,
  moderateComment: (commentId: string | number) =>
    `/comments/${commentId}/moderate`,
  adminComments: "/admin/comments",

  // Follow
  follow: (userId: string | number) => `/authors/${userId}/follow`,
  following: "/me/following",
  followers: "/me/followers",
  followStatus: (userId: string | number) => `/authors/${userId}/follow-status`,

  // Media Library
  media: "/media",
  mediaItem: (id: string | number) => `/media/${id}`,

  // Notifications
  notifications: "/notifications",
  notificationRead: (id: string | number) => `/notifications/${id}/read`,
  notificationsReadAll: "/notifications/read-all",

  // Notification Settings
  notificationSettings: "/notification-settings",

  // Reports
  reports: "/reports",
  adminReports: "/admin/reports",
  adminReportReview: (id: string | number) => `/admin/reports/${id}`,

  // Ad Placements
  adPlacements: "/ad-placements",
  adPlacement: (id: string | number) => `/ad-placements/${id}`,
  activeAds: "/ads/active",

  // Ad Impressions
  adImpressions: "/ad-impressions",
  adImpressionClick: (id: string | number) => `/ad-impressions/${id}/click`,
  adminAdAnalytics: "/admin/ad-analytics",

  // Search Logs (Admin)
  adminSearchLogs: "/admin/search-logs",

  // Audit Logs (Admin)
  adminAuditLogs: "/admin/audit-logs",

  // Article Analytics (Admin)
  adminArticleAnalytics: "/admin/article-analytics",
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
