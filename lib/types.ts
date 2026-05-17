export type UserRole = "ADMIN" | "AUTHOR" | "READER" | "EDITOR";

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

export type ArticleStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string | null;
  status: ArticleStatus;
  likes_count?: number;
  bookmarks_count?: number;
  category_id: number;
  author_id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Enhanced fields
  excerpt?: string | null;
  is_featured?: boolean;
  is_breaking?: boolean;
  reading_time_minutes?: number | null;

  // Optional relationships (loaded via with())
  category?: Category;
  author?: User;
  tags?: Tag[];
  comments?: Comment[];
  likes?: Like[];
  views?: ArticleView[] | number;
  bookmarks?: Bookmark[];
  seo_meta?: SeoMeta | null;
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
  parent_id?: number | null;
  description?: string | null;
  sort_order?: number;
  children?: Category[];
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
  ip_address?: string | null; // Only visible to admin
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
  user_id?: number | null;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  read_percent?: number | null;
  time_on_page?: number | null;
  user?: User;
}

export interface Bookmark {
  id: number;
  article_id: number;
  user_id: number;
  user?: User;
}

// ==================== NEW TYPES ====================

export interface UserProfile {
  id: number;
  user_id: number;
  bio?: string | null;
  avatar?: string | null;
  website?: string | null;
  location?: string | null;
  social_links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRevision {
  id: number;
  article_id: number;
  editor_id: number;
  title: string;
  content: string;
  change_note?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  editor?: User;
}

export interface SeoMeta {
  id: number;
  article_id: number;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  schema_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MediaLibraryItem {
  id: number;
  uploader_id: number;
  filename: string;
  path: string;
  mime_type: string;
  file_size: number;
  alt_text?: string | null;
  created_at: string;
  updated_at: string;
  uploader?: User;
}

export interface SearchLog {
  id: number;
  user_id?: number | null;
  query: string;
  result_count: number;
  ip_address: string;
  created_at: string;
}

export interface AdPlacement {
  id: number;
  name: string;
  position: "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER";
  type: "BANNER" | "NATIVE" | "VIDEO";
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdImpression {
  id: number;
  placement_id: number;
  article_id?: number | null;
  user_id?: number | null;
  clicked: boolean;
  ip_address: string;
  created_at: string;
  placement?: AdPlacement;
}

export interface AdAnalytics {
  placement_id: number;
  total_impressions: number;
  total_clicks: number;
  click_through_rate: number;
  placement?: AdPlacement;
}

export interface Notification {
  id: number;
  user_id: number;
  type: "NEW_ARTICLE" | "COMMENT" | "LIKE" | "FOLLOW";
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSetting {
  id: number;
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  follow_notifications: boolean;
  comment_notifications: boolean;
  like_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  user_id: number;
  target_type: "article" | "comment" | "user";
  target_id: number;
  reason: string;
  status: "PENDING" | "REVIEWED" | "REJECTED";
  reviewed_by?: number | null;
  created_at: string;
  updated_at: string;
  user?: User;
  reviewer?: User;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: "created" | "updated" | "deleted" | "login" | "logout";
  model_type?: string | null;
  model_id?: number | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: User;
}

export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

// ==================== EXISTING TYPES ====================

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

// API Response types
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
  is_featured?: boolean;
  is_breaking?: boolean;
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
  is_featured?: boolean;
  is_breaking?: boolean;
}

export interface CommentUpdateData {
  content?: string;
  status?: CommentStatus;
}

// Stats/Analytics types
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

// Search result type
export interface SearchResult {
  articles: Article[];
  users: User[];
  tags: Tag[];
}
