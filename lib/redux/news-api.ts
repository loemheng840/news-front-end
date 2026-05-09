"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL, apiRoutes, extractArray, extractBookmarkArticles, extractEntity, extractPaginatedData } from "@/lib/api";
import type {
  Article,
  AuthResponse,
  BookmarkResponse,
  Category,
  Comment,
  CommentFormData,
  CommentStatus,
  LikeResponse,
  LoginCredentials,
  SignupCredentials,
  Tag,
  User,
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
  ],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (body) => ({
        url: apiRoutes.login,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse | { message?: string }, SignupCredentials>({
      query: (body) => ({
        url: apiRoutes.register,
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<{ message?: string }, void>({
      query: () => ({
        url: apiRoutes.logout,
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Bookmark"],
    }),
    me: builder.query<User, void>({
      query: () => apiRoutes.me,
      providesTags: ["Auth"],
    }),

    getArticles: builder.query<Article[], QueryParams | void>({
      query: (params) => `${apiRoutes.articles}${toQueryString(params || undefined)}`,
      transformResponse: (response: unknown) => extractArray<Article>(response),
      providesTags: ["Article"],
    }),
    getLatestArticles: builder.query<ReturnType<typeof extractPaginatedData<Article>>, QueryParams | void>({
      query: (params) =>
        `${apiRoutes.latestArticles}${toQueryString(params || undefined)}`,
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
      query: (params) =>
        `${apiRoutes.searchArticles}${toQueryString(params || undefined)}`,
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
      query: (id) => ({
        url: `${apiRoutes.articles}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Article"],
    }),
    submitArticle: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({
        url: apiRoutes.articleSubmit(id),
        method: "POST",
      }),
      invalidatesTags: ["Article"],
    }),
    attachArticleMeta: builder.mutation<{ message?: string }, { id: number | string; body: QueryParams }>({
      query: ({ id, body }) => ({
        url: apiRoutes.articleMeta(id),
        method: "POST",
        body,
      }),
      invalidatesTags: ["Article"],
    }),

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
    createCategory: builder.mutation<Category, { name: string }>({
      query: (body) => ({
        url: apiRoutes.categories,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<Category, { id: number | string; name: string }>({
      query: ({ id, name }) => ({
        url: `${apiRoutes.categories}/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({
        url: `${apiRoutes.categories}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Article"],
    }),

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
      query: (body) => ({
        url: apiRoutes.tags,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tag"],
    }),

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
      query: (body) => ({
        url: apiRoutes.comments,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comment"],
    }),
    updateComment: builder.mutation<Comment, { id: number | string; content: string }>({
      query: ({ id, content }) => ({
        url: `${apiRoutes.comments}/${id}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({
        url: `${apiRoutes.comments}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
    likeComment: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.commentLike(id),
        method: "POST",
      }),
      invalidatesTags: ["Comment"],
    }),
    unlikeComment: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.commentLike(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
    moderateComment: builder.mutation<{ message?: string }, { id: number | string; status: CommentStatus }>({
      query: ({ id, status }) => ({
        url: apiRoutes.moderateComment(id),
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Comment"],
    }),

    likeArticle: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.articleLike(id),
        method: "POST",
      }),
      invalidatesTags: ["Article"],
    }),
    unlikeArticle: builder.mutation<LikeResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.articleLike(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Article"],
    }),
    bookmarkArticle: builder.mutation<BookmarkResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.articleBookmark(id),
        method: "POST",
      }),
      invalidatesTags: ["Bookmark", "Article"],
    }),
    unbookmarkArticle: builder.mutation<BookmarkResponse, number | string>({
      query: (id) => ({
        url: apiRoutes.articleBookmark(id),
        method: "DELETE",
      }),
      invalidatesTags: ["Bookmark", "Article"],
    }),
    viewArticle: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({
        url: apiRoutes.articleView(id),
        method: "POST",
      }),
    }),
    getBookmarks: builder.query<Article[], void>({
      query: () => apiRoutes.bookmarks,
      transformResponse: (response: unknown) => extractBookmarkArticles(response),
      providesTags: ["Bookmark"],
    }),

    getUsers: builder.query<User[], void>({
      query: () => apiRoutes.users,
      transformResponse: (response: unknown) => extractArray<User>(response),
      providesTags: ["User"],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: apiRoutes.users,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getUser: builder.query<User, number | string>({
      query: (id) => `${apiRoutes.users}/${id}`,
      transformResponse: (response: unknown) => extractEntity<User>(response),
      providesTags: ["User"],
    }),
    updateUserRole: builder.mutation<User, { id: number | string; role: string }>({
      query: ({ id, role }) => ({
        url: `${apiRoutes.users}/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<{ message?: string }, number | string>({
      query: (id) => ({
        url: `${apiRoutes.users}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
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
  useSubmitArticleMutation,
  useAttachArticleMetaMutation,
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryArticlesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetTagsQuery,
  useGetTagArticlesQuery,
  useCreateTagMutation,
  useGetArticleCommentsQuery,
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useModerateCommentMutation,
  useLikeArticleMutation,
  useUnlikeArticleMutation,
  useBookmarkArticleMutation,
  useUnbookmarkArticleMutation,
  useViewArticleMutation,
  useGetBookmarksQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = newsApi;
