export type UserRole = "ADMIN" | "AUTHOR" | "READER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at?: string | null;
  avatar?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string | null;
  status: ArticleStatus;
  // views: number;
  category_id: number;
  author_id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;

  // Optional relationships (loaded via with())
  category?: Category;
  author?: User;
  tags?: Tag[];
  comments?: Comment[];
  likes?: Like[];
  views?: ArticleView[];
  bookmarks?: Bookmark[];
  excerpt?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;

  // Optional relations
  user?: User;
  replies?: Comment[];
  likes?: Like[];
  reactions?: Like[];
}

export interface Like {
  id: number;
  article_id: number;
  user_id: number;
  comment_id?: number | null;
  emoji?: string | null;
  user?: User;
}

export interface ArticleView {
  id: number;
  article_id: number;
  user?: User;
}

export interface Bookmark {
  id: number;
  article_id: number;
  user_id: number;
  user?: User;
}

export type EngagementType = "view" | "like" | "bookmark";

export interface Engagement {
  user_id?: number;
  article_id: number;
  type: EngagementType;
  created_at?: string;
}

export interface ShareConfig {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup?: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export type ArticleWithEngagement = Article & {
  likes?: Like[];
  bookmarks?: Bookmark[];
};
// API Response types for better type safety
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Engagement API responses
export interface LikeResponse {
  message: string;
  liked?: boolean;
  likes_count?: number;
}

export interface BookmarkResponse {
  message: string;
  bookmarked?: boolean;
}

export interface ViewResponse {
  message: string;
}

// Comment form data
export interface CommentFormData {
  article_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  status?: CommentStatus;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// Article query params
export interface ArticleQueryParams {
  category_id?: number;
  author_id?: number;
  status?: ArticleStatus;
  limit?: number;
  page?: number;
  search?: string;
  tag?: string;
}

// Update types for form submissions
export interface ArticleUpdateData {
  title?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  status?: ArticleStatus;
  category_id?: number;
  published_at?: string;
}

export interface CommentUpdateData {
  content?: string;
  status?: CommentStatus;
}

// Stats/Analytics types (if you plan to add dashboard)
export interface ArticleStats {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_bookmarks: number;
}

export interface UserStats {
  total_articles: number;
  total_comments: number;
  total_likes_received: number;
}

// Notification types (for future feature)
export interface Notification {
  id: number;
  user_id: number;
  type: "comment" | "like" | "reply" | "mention";
  data: Record<string, any>;
  read_at?: string | null;
  created_at: string;
}

// Search result type
export interface SearchResult {
  articles: Article[];
  users: User[];
  tags: Tag[];
}
