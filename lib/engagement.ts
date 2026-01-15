import { mockArticles, mockComments } from "./mock-data";
import type { Article, Comment } from "./types";

/* -------------------- ARTICLES -------------------- */

export function getLikeCount(article: Article): number {
  return article.likes?.length ?? 0;
}

export function getBookmarkCount(article: Article): number {
  return article.bookmarks?.length ?? 0;
}

/* -------------------- COMMENTS -------------------- */

export function getCommentCount(articleId: number): number {
  return mockComments.filter(
    (c) => c.article_id === articleId && c.parent_id == null
  ).length;
}

/* -------------------- USER ENGAGEMENT -------------------- */

// FIX: likes is Like[], not userId[]
export function getUserLikes(userId: number): Article[] {
  return mockArticles.filter((a) => a.likes?.some((l) => l.user_id === userId));
}

// FIX: bookmarks is Bookmark[], not userId[]
export function getUserBookmarks(userId: number): Article[] {
  return mockArticles.filter((a) =>
    a.bookmarks?.some((b) => b.user_id === userId)
  );
}

/* -------------------- ARTICLE COMMENTS -------------------- */

export function getArticleComments(
  articleId: number,
  includeReplies = true
): Comment[] {
  const comments = mockComments.filter(
    (c) =>
      c.article_id === articleId &&
      (includeReplies ? true : c.parent_id == null)
  );

  return comments.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getCommentReplies(commentId: number): Comment[] {
  return mockComments
    .filter((c) => c.parent_id === commentId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
}

export function getApprovedComments(articleId: number): Comment[] {
  return getArticleComments(articleId).filter((c) => c.status === "APPROVED");
}

export function getPendingComments(): Comment[] {
  return mockComments.filter((c) => c.status === "PENDING");
}

export function commentLikeCount(comment: Comment): number {
  return comment.likes?.length ?? 0;
}
