const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Client-side API wrapper for route handlers
export const apiClient = {
  async getArticles(page = 1): Promise<PaginatedResponse<any>> {
    const res = await fetch(`/api/proxy/articles?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch articles`);
    return res.json();
  },

  async searchArticles(
    query: string,
    page = 1
  ): Promise<PaginatedResponse<any>> {
    const res = await fetch(
      `/api/proxy/articles/search?q=${encodeURIComponent(query)}&page=${page}`
    );
    if (!res.ok) throw new Error(`Search failed`);
    return res.json();
  },

  async getArticlesByDate(
    from: string,
    to: string,
    page = 1
  ): Promise<PaginatedResponse<any>> {
    const res = await fetch(
      `/api/proxy/articles/date?from=${from}&to=${to}&page=${page}`
    );
    if (!res.ok) throw new Error(`Failed to fetch articles by date`);
    return res.json();
  },

  async getLatestArticles(page = 1): Promise<PaginatedResponse<any>> {
    const res = await fetch(`/api/proxy/articles/latest?page=${page}`);
    if (!res.ok) throw new Error(`Failed to fetch latest articles`);
    return res.json();
  },

  async getArticleBySlug(slug: string): Promise<any> {
    const res = await fetch(`/api/proxy/articles/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch article`);
    return res.json();
  },

  async getTrendingArticles(limit = 5): Promise<any[]> {
    const response = await this.getArticles(1);
    return response.data
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },

  async getTags(): Promise<any[]> {
    try {
      const res = await fetch(`/api/proxy/tags`);
      if (!res.ok) throw new Error("Failed to fetch tags");
      return res.json();
    } catch (error) {
      console.error("[API] Error fetching tags:", error);
      return [];
    }
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await fetch(`/api/proxy/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    } catch (error) {
      console.error("[API] Error fetching categories:", error);
      return [];
    }
  },
};
export async function fetchBookmarks(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to load bookmarks");

  return await res.json();
}
const API = process.env.NEXT_PUBLIC_API_URL;

export async function fetchUsers(token: string) {
  const res = await fetch(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateUserRole(id: number, role: string, token: string) {
  return fetch(`${API}/users/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(id: number, token: string) {
  return fetch(`${API}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchArticles(token: string) {
  const res = await fetch(`${API}/articles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function updateArticle(id: number, data: any, token: string) {
  return fetch(`${API}/articles/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(id: number, token: string) {
  return fetch(`${API}/articles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
