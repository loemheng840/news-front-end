"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL, apiRoutes, extractArray, extractBookmarkArticles, extractEntity, extractPaginatedData } from "@/lib/api";
import type {
  AdAnalytics,
  AdImpression,
  AdPlacement,
  Article,
  ArticleRevision,
  AuditLog,
  AuthResponse,
  BookmarkResponse,
  Category,
  Comment,
  CommentFormData,
  CommentStatus,
  LikeResponse,
  LoginCredentials,
  MediaLibraryItem,
  Notification,
  NotificationSetting,
  Report,
  SearchLog,
  SeoMeta,
  SignupCredentials,
  Tag,
  User,
  UserProfile,
} from "@/lib/types";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type ArticlePayload = Omit<Partial<Article>, "thumbnail"> & {
  tag_ids?: number[];
  featured?: boolean;
  thumbnail?: File | null;
};

type CommentPayload = Pick<CommentFormData, "article_id" | "content"> & {
  parent_id?: number | null;
};

const toQueryString = (params?: QueryParams) => {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

const buildArticleFormData = (payload: ArticlePayload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "tag_ids" && Array.isArray(value)) {
      value.forEach((tagId) => formData.append("tag_ids[]", String(tagId)));
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
};

export const newsApi = createApi({
  reducerPath: "newsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "Article",
    "Category",
    "Tag",
    "Comment",
    "Bookmark",
    "User",
    "Profile",
    "Notification",
    "NotificationSetting",
    "Media",
    "AdPlacement",
    "Report",
    "AuditLog",
    "SearchLog",
    "Follow",
  ],
  endpoints: (builder) => ({
    // ==================== AUTH ====================
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (body) => ({ url: apiRoutes.login, method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse | { message?: string }, SignupCredentials>({
      query: (body) => ({ url: apiRoutes.register, method: "POST", body }),
    }),
    logout: builder.mutation<{ message?: string }, void>({
      query: () => ({ url: apiRoutes.logout, method: "POST" }),
      invalidatesTags: ["Auth", "Bookmark"],
    }),
    me: builder.query<User, void>({
      query: () => apiRoutes.me,
      providesTags: ["Auth"],
    }),

    // ==================== ARTICLES ====================
    getArticles: builder.query<Article[], QueryParams | void>({
      query: (params) => `${apiRoutes.articles}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getLatestArticles: builder.query<ReturnType<typeof extractPaginatedData<Article>>, QueryParams | void>({
      query: (params) => `${apiRoutes.latestArticles}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    getTrendingArticles: builder.query<Article[], void>({
      query: () => apiRoutes.trendingArticles,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getFeaturedArticles: builder.query<Article[], void>({
      query: () => apiRoutes.featuredArticles,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    searchArticles: builder.query<ReturnType<typeof extractPaginatedData<Article>>, QueryParams | void>({
      query: (params) => `${apiRoutes.searchArticles}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    getArticlesByDate: builder.query<ReturnType<typeof extractPaginatedData<Article>>, QueryParams>({
      query: (params) => `${apiRoutes.articlesByDate}${toQueryString(params)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    getArticlesByCategory: builder.query<ReturnType<typeof extractPaginatedData<Article>>, string>({
      query: (slug) => apiRoutes.articleByCategory(slug),
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    getArticlesByTag: builder.query<ReturnType<typeof extractPaginatedData<Article>>, string>({
      query: (slug) => apiRoutes.articleByTag(slug),
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    getArticleBySlug: builder.query<Article, string>({
      query: (slug) => `${apiRoutes.articles}/${slug}`,
      transformResponse: (response: unknown) => extractEntity<Article>(response),
      providesTags: (_result, _error, slug) => [{ type: "Article", id: slug }],
    }),
    getRelatedArticles: builder.query<Article[], string | number>({
      query: (id) => apiRoutes.articleRelated(id),
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getEditorArticles: builder.query<Article[], void>({
      query: () => apiRoutes.editorArticles,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getMyArticles: builder.query<Article[], void>({
      query: () => apiRoutes.myArticles,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getAdminArticles: builder.query<Article[], void>({
      query: () => apiRoutes.adminArticles,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    createArticle: builder.mutation<Article, ArticlePayload>({
      query: (body) => ({
        url: apiRoutes.articles,
        method: "POST",
        body: buildArticleFormData(body),
      }),
      transformResponse: (response: unknown) => extractEntity<Article>(response),
      invalidatesTags: ["Article"],
    }),
    updateArticle: builder.mutation<Article, { id: number | string; data: ArticlePayload }>({
      query: ({ id, data }) => ({
        url: `${apiRoutes.articles}/${id}`,
        method: "POST",
        body: (() => {
          const formData = buildArticleFormData(data);
          formData.append("_method", "PUT");
          return formData;
        })(),
      }),
      transformResponse: (response: unknown) => extractEntity<Article>(response, "article"),
      invalidatesTags: ["Article"],
    }),
    deleteArticle: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: `${apiRoutes.articles}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Article"],
    }),
    restoreArticle: builder.mutation<{ message?: string; article?: Article }, number | string>({
      query: (id) => ({ url: apiRoutes.articleRestore(id), method: "POST" }),
      invalidatesTags: ["Article"],
    }),
    submitArticle: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: apiRoutes.articleSubmit(id), method: "POST" }),
      invalidatesTags: ["Article"],
    }),
    attachArticleMeta: builder.mutation<{ message?: string }, { id: number | string; body: QueryParams }>({
      query: ({ id, body }) => ({ url: apiRoutes.articleMeta(id), method: "POST", body }),
      invalidatesTags: ["Article"],
    }),

    // ==================== ARTICLE REVISIONS ====================
    getArticleRevisions: builder.query<ReturnType<typeof extractPaginatedData<ArticleRevision>>, number | string>({
      query: (articleId) => apiRoutes.articleRevisions(articleId),
      transformResponse: (response: unknown) => extractPaginatedData<ArticleRevision>(response),
    }),
    getArticleRevision: builder.query<ArticleRevision, { articleId: number | string; version: number }>({
      query: ({ articleId, version }) => apiRoutes.articleRevision(articleId, version),
      transformResponse: (response: unknown) => extractEntity<ArticleRevision>(response),
    }),

    // ==================== SEO META ====================
    getArticleSeo: builder.query<SeoMeta, number | string>({
      query: (articleId) => apiRoutes.articleSeo(articleId),
      transformResponse: (response: unknown) => extractEntity<SeoMeta>(response),
    }),
    upsertArticleSeo: builder.mutation<SeoMeta, { articleId: number | string; data: Partial<SeoMeta> }>({
      query: ({ articleId, data }) => ({
        url: apiRoutes.articleSeo(articleId),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Article"],
    }),

    // ==================== CATEGORIES ====================
    getCategories: builder.query<Category[], void>({
      query: () => apiRoutes.categories,
      transformResponse: (response: unknown) => extractArray<Category>(response),
      providesTags: ["Category"],
    }),
    getCategoryBySlug: builder.query<Category, string>({
      query: (slug) => apiRoutes.categoryBySlug(slug),
      transformResponse: (response: unknown) => extractEntity<Category>(response),
      providesTags: (_result, _error, slug) => [{ type: "Category", id: slug }],
    }),
    getCategoryArticles: builder.query<ReturnType<typeof extractPaginatedData<Article>>, string>({
      query: (slug) => apiRoutes.categoryArticles(slug),
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    createCategory: builder.mutation<Category, { name: string; parent_id?: number; description?: string; sort_order?: number }>({
      query: (body) => ({ url: apiRoutes.categories, method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<Category, { id: number | string; data: Partial<Category> }>({
      query: ({ id, data }) => ({ url: `${apiRoutes.categories}/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: `${apiRoutes.categories}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category", "Article"],
    }),

    // ==================== TAGS ====================
    getTags: builder.query<Tag[], void>({
      query: () => apiRoutes.tags,
      transformResponse: (response: unknown) => extractArray<Tag>(response),
      providesTags: ["Tag"],
    }),
    getTagArticles: builder.query<ReturnType<typeof extractPaginatedData<Article>>, string>({
      query: (slug) => apiRoutes.tagArticles(slug),
      transformResponse: (response: unknown) => extractPaginatedData<Article>(response),
      providesTags: ["Article"],
    }),
    createTag: builder.mutation<Tag, { name: string }>({
      query: (body) => ({ url: apiRoutes.tags, method: "POST", body }),
      invalidatesTags: ["Tag"],
    }),

    // ==================== COMMENTS ====================
    getArticleComments: builder.query<Comment[], string | number>({
      query: (articleId) => apiRoutes.articleComments(articleId),
      transformResponse: (response: unknown) => extractArray<Comment>(response),
      providesTags: ["Comment"],
    }),
    getCommentReplies: builder.query<Comment[], string | number>({
      query: (commentId) => apiRoutes.commentReplies(commentId),
      transformResponse: (response: unknown) => extractArray<Comment>(response),
      providesTags: ["Comment"],
    }),
    createComment: builder.mutation<Comment, CommentPayload>({
      query: (body) => ({ url: apiRoutes.comments, method: "POST", body }),
      invalidatesTags: ["Comment"],
    }),
    updateComment: builder.mutation<Comment, { id: number | string; content: string }>({
      query: ({ id, content }) => ({ url: `${apiRoutes.comments}/${id}`, method: "PUT", body: { content } }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: `${apiRoutes.comments}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Comment"],
    }),
    likeComment: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({ url: apiRoutes.commentLike(id), method: "POST" }),
      invalidatesTags: ["Comment"],
    }),
    unlikeComment: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({ url: apiRoutes.commentLike(id), method: "DELETE" }),
      invalidatesTags: ["Comment"],
    }),
    reactToComment: builder.mutation<{ message: string; action: string }, { commentId: number | string; emoji: string }>({
      query: ({ commentId, emoji }) => ({
        url: apiRoutes.commentReact(commentId),
        method: "POST",
        body: { emoji },
      }),
      invalidatesTags: ["Comment"],
    }),
    getCommentReactions: builder.query<{ reactions: { emoji: string; count: number }[]; user_reactions: string[] }, number | string>({
      query: (commentId) => apiRoutes.commentReactions(commentId),
      providesTags: ["Comment"],
    }),
    moderateComment: builder.mutation<{ message?: string }, { id: number | string; status: CommentStatus }>({
      query: ({ id, status }) => ({ url: apiRoutes.moderateComment(id), method: "PATCH", body: { status } }),
      invalidatesTags: ["Comment"],
    }),
    getAdminComments: builder.query<ReturnType<typeof extractPaginatedData<Comment>>, QueryParams | void>({
      query: (params) => `${apiRoutes.adminComments}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Comment>(response),
      providesTags: ["Comment"],
    }),

    // ==================== ENGAGEMENT ====================
    likeArticle: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({ url: apiRoutes.articleLike(id), method: "POST" }),
      invalidatesTags: ["Article"],
    }),
    unlikeArticle: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({ url: apiRoutes.articleLike(id), method: "DELETE" }),
      invalidatesTags: ["Article"],
    }),
    bookmarkArticle: builder.mutation<BookmarkResponse, number | string>({
      query: (id) => ({ url: apiRoutes.articleBookmark(id), method: "POST" }),
      invalidatesTags: ["Bookmark", "Article"],
    }),
    unbookmarkArticle: builder.mutation<BookmarkResponse, number | string>({
      query: (id) => ({ url: apiRoutes.articleBookmark(id), method: "DELETE" }),
      invalidatesTags: ["Bookmark", "Article"],
    }),
    viewArticle: builder.mutation<{ message?: string }, { id: number | string; data?: { read_percent?: number; time_on_page?: number; session_id?: string; referrer?: string } }>({
      query: ({ id, data }) => ({ url: apiRoutes.articleView(id), method: "POST", body: data }),
    }),
    getBookmarks: builder.query<Article[], void>({
      query: () => apiRoutes.bookmarks,
      transformResponse: (response: unknown) => extractBookmarkArticles(response),
      providesTags: ["Bookmark"],
    }),

    // ==================== USER PROFILE ====================
    getProfile: builder.query<UserProfile, void>({
      query: () => apiRoutes.profile,
      transformResponse: (response: unknown) => extractEntity<UserProfile>(response),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<UserProfile, FormData>({
      query: (body) => ({ url: apiRoutes.profile, method: "POST", body: (() => { body.append("_method", "PUT"); return body; })() }),
      invalidatesTags: ["Profile"],
    }),
    getPublicProfile: builder.query<UserProfile, number | string>({
      query: (userId) => apiRoutes.userProfile(userId),
      transformResponse: (response: unknown) => extractEntity<UserProfile>(response),
    }),

    // ==================== FOLLOW ====================
    followUser: builder.mutation<{ data: { following_id: number; following_name: string; followed_at: string } }, number | string>({
      query: (userId) => ({ url: apiRoutes.follow(userId), method: "POST" }),
      invalidatesTags: ["Follow"],
    }),
    unfollowUser: builder.mutation<{ message?: string }, number | string>({
      query: (userId) => ({ url: apiRoutes.follow(userId), method: "DELETE" }),
      invalidatesTags: ["Follow"],
    }),
    getFollowing: builder.query<ReturnType<typeof extractPaginatedData<{ id: number; name: string; email: string; followed_at: string }>>, void>({
      query: () => apiRoutes.following,
      transformResponse: (response: unknown) => extractPaginatedData<{ id: number; name: string; email: string; followed_at: string }>(response),
      providesTags: ["Follow"],
    }),
    getFollowers: builder.query<ReturnType<typeof extractPaginatedData<{ id: number; name: string; followed_at: string }>>, void>({
      query: () => apiRoutes.followers,
      transformResponse: (response: unknown) => extractPaginatedData<{ id: number; name: string; followed_at: string }>(response),
      providesTags: ["Follow"],
    }),
    getFollowStatus: builder.query<{ data: { is_following: boolean; followed_at?: string | null } }, number | string>({
      query: (userId) => apiRoutes.followStatus(userId),
      providesTags: ["Follow"],
    }),

    // ==================== MEDIA LIBRARY ====================
    uploadMedia: builder.mutation<MediaLibraryItem, FormData>({
      query: (body) => ({ url: apiRoutes.media, method: "POST", body }),
      invalidatesTags: ["Media"],
    }),
    getMedia: builder.query<ReturnType<typeof extractPaginatedData<MediaLibraryItem>>, QueryParams | void>({
      query: (params) => `${apiRoutes.media}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<MediaLibraryItem>(response),
      providesTags: ["Media"],
    }),
    deleteMedia: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: apiRoutes.mediaItem(id), method: "DELETE" }),
      invalidatesTags: ["Media"],
    }),

    // ==================== NOTIFICATIONS ====================
    getNotifications: builder.query<ReturnType<typeof extractPaginatedData<Notification>>, QueryParams | void>({
      query: (params) => `${apiRoutes.notifications}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Notification>(response),
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation<Notification, number | string>({
      query: (id) => ({ url: apiRoutes.notificationRead(id), method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsRead: builder.mutation<{ message?: string }, void>({
      query: () => ({ url: apiRoutes.notificationsReadAll, method: "POST" }),
      invalidatesTags: ["Notification"],
    }),

    // ==================== NOTIFICATION SETTINGS ====================
    getNotificationSettings: builder.query<NotificationSetting, void>({
      query: () => apiRoutes.notificationSettings,
      transformResponse: (response: unknown) => extractEntity<NotificationSetting>(response),
      providesTags: ["NotificationSetting"],
    }),
    updateNotificationSettings: builder.mutation<NotificationSetting, Partial<NotificationSetting>>({
      query: (body) => ({ url: apiRoutes.notificationSettings, method: "PUT", body }),
      invalidatesTags: ["NotificationSetting"],
    }),

    // ==================== REPORTS ====================
    createReport: builder.mutation<Report, { target_type: string; target_id: number; reason: string }>({
      query: (body) => ({ url: apiRoutes.reports, method: "POST", body }),
      invalidatesTags: ["Report"],
    }),
    getAdminReports: builder.query<ReturnType<typeof extractPaginatedData<Report>>, QueryParams | void>({
      query: (params) => `${apiRoutes.adminReports}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<Report>(response),
      providesTags: ["Report"],
    }),
    reviewReport: builder.mutation<Report, { id: number | string; status: "REVIEWED" | "REJECTED" }>({
      query: ({ id, status }) => ({ url: apiRoutes.adminReportReview(id), method: "PATCH", body: { status } }),
      invalidatesTags: ["Report"],
    }),

    // ==================== AD PLACEMENTS ====================
    getAdPlacements: builder.query<ReturnType<typeof extractPaginatedData<AdPlacement>>, void>({
      query: () => apiRoutes.adPlacements,
      transformResponse: (response: unknown) => extractPaginatedData<AdPlacement>(response),
      providesTags: ["AdPlacement"],
    }),
    getActiveAds: builder.query<AdPlacement[], void>({
      query: () => apiRoutes.activeAds,
      transformResponse: (response: unknown) => extractArray<AdPlacement>(response),
    }),
    createAdPlacement: builder.mutation<AdPlacement, Partial<AdPlacement>>({
      query: (body) => ({ url: apiRoutes.adPlacements, method: "POST", body }),
      invalidatesTags: ["AdPlacement"],
    }),
    updateAdPlacement: builder.mutation<AdPlacement, { id: number | string; data: Partial<AdPlacement> }>({
      query: ({ id, data }) => ({ url: apiRoutes.adPlacement(id), method: "PUT", body: data }),
      invalidatesTags: ["AdPlacement"],
    }),
    deleteAdPlacement: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: apiRoutes.adPlacement(id), method: "DELETE" }),
      invalidatesTags: ["AdPlacement"],
    }),

    // ==================== AD IMPRESSIONS ====================
    recordAdImpression: builder.mutation<AdImpression, { placement_id: number; article_id?: number; ip_address: string }>({
      query: (body) => ({ url: apiRoutes.adImpressions, method: "POST", body }),
    }),
    clickAdImpression: builder.mutation<AdImpression, number | string>({
      query: (id) => ({ url: apiRoutes.adImpressionClick(id), method: "PATCH" }),
    }),
    getAdAnalytics: builder.query<AdAnalytics[], QueryParams | void>({
      query: (params) => `${apiRoutes.adminAdAnalytics}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractArray<AdAnalytics>(response),
    }),

    // ==================== SEARCH LOGS (ADMIN) ====================
    getSearchLogs: builder.query<ReturnType<typeof extractPaginatedData<SearchLog>>, QueryParams | void>({
      query: (params) => `${apiRoutes.adminSearchLogs}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<SearchLog>(response),
      providesTags: ["SearchLog"],
    }),

    // ==================== AUDIT LOGS (ADMIN) ====================
    getAuditLogs: builder.query<ReturnType<typeof extractPaginatedData<AuditLog>>, QueryParams | void>({
      query: (params) => `${apiRoutes.adminAuditLogs}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractPaginatedData<AuditLog>(response),
      providesTags: ["AuditLog"],
    }),

    // ==================== USERS (ADMIN) ====================
    getUsers: builder.query<User[], void>({
      query: () => apiRoutes.users,
      transformResponse: (response: unknown) => extractArray<User>(response),
      providesTags: ["User"],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({ url: apiRoutes.users, method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    getUser: builder.query<User, number | string>({
      query: (id) => `${apiRoutes.users}/${id}`,
      transformResponse: (response: unknown) => extractEntity<User>(response),
      providesTags: ["User"],
    }),
    updateUserRole: builder.mutation<User, { id: number | string; role: string }>({
      query: ({ id, role }) => ({ url: `${apiRoutes.users}/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({ url: `${apiRoutes.users}/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
  // Articles
  useGetArticlesQuery,
  useGetLatestArticlesQuery,
  useGetTrendingArticlesQuery,
  useGetFeaturedArticlesQuery,
  useSearchArticlesQuery,
  useGetArticlesByDateQuery,
  useGetArticlesByCategoryQuery,
  useGetArticlesByTagQuery,
  useGetArticleBySlugQuery,
  useGetRelatedArticlesQuery,
  useGetEditorArticlesQuery,
  useGetMyArticlesQuery,
  useGetAdminArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useRestoreArticleMutation,
  useSubmitArticleMutation,
  useAttachArticleMetaMutation,
  // Article Revisions
  useGetArticleRevisionsQuery,
  useGetArticleRevisionQuery,
  // SEO Meta
  useGetArticleSeoQuery,
  useUpsertArticleSeoMutation,
  // Categories
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryArticlesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  // Tags
  useGetTagsQuery,
  useGetTagArticlesQuery,
  useCreateTagMutation,
  // Comments
  useGetArticleCommentsQuery,
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useReactToCommentMutation,
  useGetCommentReactionsQuery,
  useModerateCommentMutation,
  useGetAdminCommentsQuery,
  // Engagement
  useLikeArticleMutation,
  useUnlikeArticleMutation,
  useBookmarkArticleMutation,
  useUnbookmarkArticleMutation,
  useViewArticleMutation,
  useGetBookmarksQuery,
  // Profile
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetPublicProfileQuery,
  // Follow
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowingQuery,
  useGetFollowersQuery,
  useGetFollowStatusQuery,
  // Media
  useUploadMediaMutation,
  useGetMediaQuery,
  useDeleteMediaMutation,
  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  // Notification Settings
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  // Reports
  useCreateReportMutation,
  useGetAdminReportsQuery,
  useReviewReportMutation,
  // Ad Placements
  useGetAdPlacementsQuery,
  useGetActiveAdsQuery,
  useCreateAdPlacementMutation,
  useUpdateAdPlacementMutation,
  useDeleteAdPlacementMutation,
  // Ad Impressions
  useRecordAdImpressionMutation,
  useClickAdImpressionMutation,
  useGetAdAnalyticsQuery,
  // Search Logs
  useGetSearchLogsQuery,
  // Audit Logs
  useGetAuditLogsQuery,
  // Users
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = newsApi;
