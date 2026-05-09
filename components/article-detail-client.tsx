"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  ThumbsUp,
  Reply,
  Trash2,
  Edit2,
  MoreVertical,
  Send,
  X,
  Loader2,
  Share2,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import SocialShare from "./social-share";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import {
  useBookmarkArticleMutation,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetArticleCommentsQuery,
  useGetBookmarksQuery,
  useLazyGetCommentRepliesQuery,
  useLikeArticleMutation,
  useLikeCommentMutation,
  useUnbookmarkArticleMutation,
  useUnlikeArticleMutation,
  useUnlikeCommentMutation,
  useUpdateCommentMutation,
  useViewArticleMutation,
} from "@/lib/redux/news-api";

// Type definitions
type UserRole = "ADMIN" | "AUTHOR" | "READER" | "EDITOR";

interface User {
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

type ArticleStatus = "DRAFT" | "PUBLISHED";

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string | null;
  status: ArticleStatus;
  category_id: number;
  author_id: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: User;
  likes?: any[];
}

type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: CommentWithEngagement[];
  likes_count?: number;
  is_liked?: boolean;
}

interface CommentWithEngagement extends Comment {
  likes_count: number;
  is_liked: boolean;
  user: User;
}

// Simple Button component
const Button = ({
  children,
  onClick,
  disabled,
  size = "default",
  variant = "default",
  className = "",
  ...props
}: any) => {
  const baseStyles =
    "rounded-lg font-medium transition inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
      : variant === "ghost"
        ? "bg-transparent hover:bg-gray-100 text-gray-700"
        : variant === "danger"
          ? "bg-red-600 hover:bg-red-700 text-white"
          : variant === "secondary"
            ? "bg-gray-600 hover:bg-gray-700 text-white"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Textarea component
const Textarea = ({ className = "", ...props }: any) => {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition ${className}`}
      {...props}
    />
  );
};

// Comment Item Component (Facebook-style)
const CommentItem = ({
  comment,
  depth = 0,
  user,
  token,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isDeleting,
  isPostingReply,
  editingComment,
  editText,
  setEditText,
  isUpdating,
  cancelEdit,
  showReplyInput,
  replyTexts,
  setReplyTexts,
  setShowReplyInput,
  onLoadReplies,
  isLoadingReplies,
}: any) => {
  const isOwner = user?.id === comment.user_id;
  const isAdmin = user?.role === "ADMIN";
  const isEditing = editingComment === comment.id;
  const showingReply = showReplyInput === comment.id;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const isDeletingThis = isDeleting === comment.id;
  const isLoadingRepliesThis = isLoadingReplies === comment.id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      "from-blue-400 to-cyan-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-teal-500",
      "from-orange-400 to-red-500",
      "from-indigo-400 to-blue-500",
      "from-yellow-400 to-orange-500",
      "from-pink-400 to-rose-500",
      "from-teal-400 to-green-500",
    ];
    return colors[id % colors.length];
  };

  const replyCount = comment.replies?.length || 0;

  return (
    <div className={`${depth > 0 ? "ml-10 mt-3" : "mt-4"}`}>
      {/* Main Comment */}
      <div className="flex gap-2 group">
        {/* Avatar */}
        <div
          className={`${depth > 0 ? "w-8 h-8" : "w-10 h-10"} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 bg-gradient-to-br ${getAvatarColor(
            comment.user?.id || 0,
          )} shadow-md`}
        >
          <span className={depth > 0 ? "text-xs" : "text-sm"}>
            {getInitials(comment.user?.name)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          {isEditing ? (
            <div className="bg-white rounded-2xl border border-blue-300 shadow-sm p-3">
              <Textarea
                value={editText}
                onChange={(e: any) => setEditText(e.target.value)}
                className="min-h-[80px] text-sm border-gray-200"
                placeholder="Edit your comment..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={() => onEdit(comment.id)}
                  disabled={isUpdating || !editText.trim()}
                  className="text-xs h-7"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={isUpdating}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full ${
                isDeletingThis ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">
                      {comment.user?.name || "Anonymous"}
                    </p>
                    {comment.user?.role === "ADMIN" && (
                      <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded">
                        ADMIN
                      </span>
                    )}
                    {comment.user?.role === "AUTHOR" && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">
                        AUTHOR
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm break-words leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* Dropdown Menu */}
                {(isOwner || isAdmin) && !isDeletingThis && (
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                          {isOwner && (
                            <button
                              onClick={() => {
                                onEdit(comment.id, comment.content);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center text-gray-700 text-sm"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this comment?",
                                )
                              ) {
                                onDelete(comment.id);
                                setIsDropdownOpen(false);
                              }
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center text-red-600 text-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons (Facebook-style) */}
          {!isEditing && !isDeletingThis && (
            <div className="flex items-center gap-3 mt-1 px-3 text-xs font-semibold">
              <button
                onClick={() => onLike(comment.id, comment.is_liked)}
                className={`${
                  comment.is_liked
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                } transition`}
                disabled={!user}
              >
                Like
                {comment.likes_count > 0 && ` · ${comment.likes_count}`}
              </button>

              <button
                onClick={() =>
                  setShowReplyInput(showingReply ? null : comment.id)
                }
                className="text-gray-600 hover:text-blue-600 transition"
                disabled={!user}
              >
                Reply
              </button>

              <span className="text-gray-500 font-normal">
                {formatDate(comment.created_at)}
              </span>

              {comment.updated_at !== comment.created_at && (
                <span className="text-gray-400 font-normal italic">
                  (edited)
                </span>
              )}
            </div>
          )}

          {isDeletingThis && (
            <div className="flex items-center gap-2 text-gray-500 text-xs mt-1 px-3">
              <Loader2 className="h-3 w-3 animate-spin" />
              Deleting...
            </div>
          )}

          {/* Reply Input (Facebook-style) */}
          {showingReply && user && (
            <div className="flex gap-2 mt-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 bg-gradient-to-br ${getAvatarColor(
                  user.id,
                )} shadow-md text-xs`}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                <Textarea
                  placeholder={`Reply to ${comment.user?.name || "user"}...`}
                  value={replyTexts[comment.id] || ""}
                  onChange={(e: any) =>
                    setReplyTexts({
                      ...replyTexts,
                      [comment.id]: e.target.value,
                    })
                  }
                  className="min-h-[60px] text-sm bg-transparent border-0 p-0 focus:ring-0"
                  autoFocus
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (replyTexts[comment.id]?.trim()) {
                        onReply(comment.id);
                      }
                    }
                  }}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <Button
                    size="sm"
                    onClick={() => onReply(comment.id)}
                    disabled={
                      !replyTexts[comment.id]?.trim() ||
                      isPostingReply === comment.id
                    }
                    className="text-xs h-7"
                  >
                    {isPostingReply === comment.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Reply
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowReplyInput(null);
                      setReplyTexts({ ...replyTexts, [comment.id]: "" });
                    }}
                    disabled={isPostingReply === comment.id}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show/Hide Replies Button (Facebook-style) */}
          {replyCount > 0 && (
            <button
              onClick={() => {
                if (
                  !showReplies &&
                  (!comment.replies || comment.replies.length === 0)
                ) {
                  onLoadReplies(comment.id);
                }
                setShowReplies(!showReplies);
              }}
              className="flex items-center gap-2 mt-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-full text-xs font-semibold transition"
              disabled={isLoadingRepliesThis}
            >
              {isLoadingRepliesThis ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading replies...
                </>
              ) : showReplies ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  View {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </>
              )}
            </button>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply: CommentWithEngagement) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  user={user}
                  token={token}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  isDeleting={isDeleting}
                  isPostingReply={isPostingReply}
                  editingComment={editingComment}
                  editText={editText}
                  setEditText={setEditText}
                  isUpdating={isUpdating}
                  cancelEdit={cancelEdit}
                  showReplyInput={showReplyInput}
                  replyTexts={replyTexts}
                  setReplyTexts={setReplyTexts}
                  setShowReplyInput={setShowReplyInput}
                  onLoadReplies={onLoadReplies}
                  isLoadingReplies={isLoadingReplies}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ArticleDetailClient({ article }: { article: Article }) {
  const { user, token } = useAuth();
  const { data: bookmarkList = [] } = useGetBookmarksQuery(undefined, {
    skip: !user,
  });
  const {
    data: fetchedComments = [],
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetArticleCommentsQuery(article.id, {
    skip: !article.id,
  });
  const [loadRepliesQuery] = useLazyGetCommentRepliesQuery();
  const [viewArticle] = useViewArticleMutation();
  const [likeArticle] = useLikeArticleMutation();
  const [unlikeArticle] = useUnlikeArticleMutation();
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [unbookmarkArticle] = useUnbookmarkArticleMutation();
  const [createComment] = useCreateCommentMutation();
  const [updateCommentMutation] = useUpdateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();
  const [unlikeComment] = useUnlikeCommentMutation();

  // Article engagement state
  const [likes, setLikes] = useState(article.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentWithEngagement[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Reply state
  const [showReplyInput, setShowReplyInput] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [isPostingReply, setIsPostingReply] = useState<number | null>(null);

  // Edit state
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Load replies state
  const [isLoadingReplies, setIsLoadingReplies] = useState<number | null>(null);

  // Load comments and track view
  useEffect(() => {
    checkUserLikeStatus();
    checkUserBookmarkStatus();

    if (token) {
      viewArticle(article.id).catch((error) =>
        console.error("Error tracking view:", error),
      );
    }
  }, [article.id, token, viewArticle]);

  useEffect(() => {
    setComments(organizeComments(fetchedComments));
  }, [fetchedComments]);

  useEffect(() => {
    setIsLoadingComments(commentsLoading);
  }, [commentsLoading]);

  const checkUserLikeStatus = useCallback(async () => {
    if (!token || !user?.id) return;

    const articleLikes = Array.isArray(article.likes) ? article.likes : [];
    setLiked(articleLikes.some((like: any) => like.user_id === user.id));
  }, [article.likes, token, user?.id]);

  const checkUserBookmarkStatus = useCallback(async () => {
    if (!token) return;

    const isBookmarked = bookmarkList.some(
      (bookmark: any) => bookmark.id === article.id || bookmark.article?.id === article.id,
    );
    setBookmarked(isBookmarked);
  }, [article.id, token, bookmarkList]);

  const toggleArticleLike = async () => {
    if (!user) {
      alert("Please login to like articles");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = liked;
    const previousLikes = likes;

    try {
      // Optimistic update
      if (previousLiked) {
        setLikes((prev) => prev - 1);
      } else {
        setLikes((prev) => prev + 1);
      }
      setLiked(!previousLiked);

      if (previousLiked) {
        await unlikeArticle(article.id).unwrap();
      } else {
        await likeArticle(article.id).unwrap();
      }
    } catch (error: any) {
      console.error("Error toggling article like:", error);
      alert(error.message || "Failed to update like. Please try again.");

      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please login to bookmark articles");
      return;
    }

    if (isBookmarking) return;

    setIsBookmarking(true);
    const previousBookmarked = bookmarked;

    try {
      // Optimistic update
      setBookmarked(!previousBookmarked);

      if (previousBookmarked) {
        await unbookmarkArticle(article.id).unwrap();
      } else {
        await bookmarkArticle(article.id).unwrap();
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      alert(error.message || "Failed to update bookmark. Please try again.");

      // Revert on error
      setBookmarked(previousBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };

  const shareArticle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      await refetchComments();
    } finally {
      setIsLoadingComments(false);
    }
  }, [refetchComments]);

  const loadReplies = async (commentId: number) => {
    try {
      setIsLoadingReplies(commentId);
      const data = await loadRepliesQuery(commentId).unwrap();

      // Update the comment with loaded replies
      setComments((prev) => updateCommentReplies(prev, commentId, data));
    } catch (error) {
      console.error("Error loading replies:", error);
      alert("Failed to load replies. Please try again.");
    } finally {
      setIsLoadingReplies(null);
    }
  };

  const updateCommentReplies = (
    comments: CommentWithEngagement[],
    commentId: number,
    replies: any[],
  ): CommentWithEngagement[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: organizeComments(replies),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, commentId, replies),
        };
      }
      return comment;
    });
  };

  const organizeComments = (flatComments: any[]): CommentWithEngagement[] => {
    const commentMap: { [key: number]: CommentWithEngagement } = {};
    const rootComments: CommentWithEngagement[] = [];

    flatComments.forEach((comment: any) => {
      commentMap[comment.id] = {
        ...comment,
        replies: comment.replies || [],
        likes_count: comment.likes_count || 0,
        is_liked: comment.is_liked || false,
        user: comment.user || {
          id: comment.user_id,
          name: "Anonymous",
          email: "",
          role: "READER" as UserRole,
          created_at: "",
          updated_at: "",
        },
      };
    });

    flatComments.forEach((comment: any) => {
      if (comment.parent_id === null || comment.parent_id === undefined) {
        rootComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parent_id]) {
        if (!commentMap[comment.parent_id].replies) {
          commentMap[comment.parent_id].replies = [];
        }
        commentMap[comment.parent_id].replies!.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const postComment = async () => {
    if (!user) {
      alert("Please login to comment");
      return;
    }

    if (!commentText.trim()) return;

    const optimisticComment: CommentWithEngagement = {
      id: Date.now(),
      article_id: article.id,
      user_id: user.id,
      content: commentText,
      status: "APPROVED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false,
      user: user,
      replies: [],
    };

    try {
      setIsPostingComment(true);

      // Optimistic update
      setComments((prev) => [optimisticComment, ...prev]);
      setCommentText("");

      await createComment({
          article_id: article.id,
          content: commentText,
      }).unwrap();

      await loadComments();
    } catch (error: any) {
      console.error("Error posting comment:", error);
      alert(error.message || "Failed to post comment. Please try again.");

      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setCommentText(commentText);
    } finally {
      setIsPostingComment(false);
    }
  };

  const postReply = async (parentId: number) => {
    if (!user) {
      alert("Please login to reply");
      return;
    }

    const replyText = replyTexts[parentId];
    if (!replyText?.trim()) return;

    const optimisticReply: CommentWithEngagement = {
      id: Date.now(),
      article_id: article.id,
      user_id: user.id,
      parent_id: parentId,
      content: replyText,
      status: "APPROVED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false,
      user: user,
      replies: [],
    };

    try {
      setIsPostingReply(parentId);

      // Optimistic update
      setComments((prev) => addReplyToTree(prev, parentId, optimisticReply));
      setReplyTexts({ ...replyTexts, [parentId]: "" });
      setShowReplyInput(null);

      await createComment({
          article_id: article.id,
          parent_id: parentId,
          content: replyText,
      }).unwrap();

      await loadComments();
    } catch (error: any) {
      console.error("Error posting reply:", error);
      alert(error.message || "Failed to post reply. Please try again.");

      setComments((prev) => removeReplyFromTree(prev, optimisticReply.id));
      setReplyTexts({ ...replyTexts, [parentId]: replyText });
      setShowReplyInput(parentId);
    } finally {
      setIsPostingReply(null);
    }
  };

  const addReplyToTree = (
    comments: CommentWithEngagement[],
    parentId: number,
    newReply: CommentWithEngagement,
  ): CommentWithEngagement[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToTree(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  const removeReplyFromTree = (
    comments: CommentWithEngagement[],
    replyId: number,
  ): CommentWithEngagement[] => {
    return comments
      .map((comment) => {
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: removeReplyFromTree(comment.replies, replyId),
          };
        }
        return comment;
      })
      .filter((comment) => comment.id !== replyId);
  };

  const startEdit = (commentId: number, content: string) => {
    setEditingComment(commentId);
    setEditText(content);
  };

  const updateComment = async (commentId: number) => {
    if (!user || !editText.trim()) return;

    const previousComments = comments;
    const previousEditText = editText;

    try {
      setIsUpdating(true);

      // Optimistic update
      setComments((prev) => updateCommentInTree(prev, commentId, editText));
      setEditingComment(null);
      setEditText("");

      await updateCommentMutation({ id: commentId, content: editText }).unwrap();
    } catch (error: any) {
      console.error("Error updating comment:", error);
      alert(error.message || "Failed to update comment. Please try again.");

      setComments(previousComments);
      setEditText(previousEditText);
      setEditingComment(commentId);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCommentInTree = (
    comments: CommentWithEngagement[],
    commentId: number,
    newContent: string,
  ): CommentWithEngagement[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: newContent,
          updated_at: new Date().toISOString(),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, newContent),
        };
      }
      return comment;
    });
  };

  const deleteComment = async (commentId: number) => {
    if (!user) return;

    const previousComments = comments;

    try {
      setIsDeleting(commentId);

      // Optimistic update
      setComments((prev) => removeCommentFromTree(prev, commentId));

      await deleteCommentMutation(commentId).unwrap();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment. Please try again.");

      setComments(previousComments);
    } finally {
      setIsDeleting(null);
    }
  };

  const removeCommentFromTree = (
    comments: CommentWithEngagement[],
    commentId: number,
  ): CommentWithEngagement[] => {
    return comments.filter((comment) => {
      if (comment.id === commentId) {
        return false;
      }
      if (comment.replies && comment.replies.length > 0) {
        comment.replies = removeCommentFromTree(comment.replies, commentId);
      }
      return true;
    });
  };

  const toggleCommentLike = async (commentId: number, isLiked: boolean) => {
    if (!user) {
      alert("Please login to like comments");
      return;
    }

    try {
      // Optimistic update
      setComments((prev) => updateCommentLike(prev, commentId, !isLiked));

      if (isLiked) {
        await unlikeComment(commentId).unwrap();
      } else {
        await likeComment(commentId).unwrap();
      }
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      alert(error.message || "Failed to update like. Please try again.");

      // Revert on error
      setComments((prev) => updateCommentLike(prev, commentId, isLiked));
    }
  };

  const updateCommentLike = (
    comments: CommentWithEngagement[],
    commentId: number,
    isLiked: boolean,
  ): CommentWithEngagement[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          is_liked: isLiked,
          likes_count: isLiked
            ? comment.likes_count + 1
            : Math.max(0, comment.likes_count - 1),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLike(comment.replies, commentId, isLiked),
        };
      }
      return comment;
    });
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalComments = (comments: CommentWithEngagement[]): number => {
    let count = comments.length;
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += totalComments(comment.replies);
      }
    });
    return count;
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200">
          {article.thumbnail && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={
                  article.thumbnail.startsWith("http")
                    ? article.thumbnail
                    : `${API_URL.replace("/api", "")}/storage/${article.thumbnail}`
                }
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=2070";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="p-8">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-sm">
                <Tag className="h-4 w-4 mr-2" />
                {article.category?.name || "Uncategorized"}
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-6 text-gray-900 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getInitials(article.author?.name || "")}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {article.author?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-10">
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-xl">
                {article.content}
              </div>
            </div>

            {/* Article Engagement Buttons */}
            <div className="flex flex-wrap items-center gap-4 py-6 border-t border-gray-200">
              <button
                onClick={toggleArticleLike}
                className={`flex items-center gap-3 px-1 py-1 rounded-full transition-all duration-300 ${
                  liked
                    ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user || isLiking}
              >
                {isLiking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                )}
                <span className="font-bold">{likes}</span>
                <span>{liked ? "Liked" : "Like"}</span>
              </button>
              <button className="flex items-center gap-3 px-1 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <MessageCircle className="h-5 w-5" />
                <span className="font-bold">{totalComments(comments)}</span>
                <span>Comments</span>
              </button>
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-3  py-1 px-1 rounded-full transition ${
                  bookmarked
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user || isBookmarking}
              >
                {isBookmarking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Bookmark
                    className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
                  />
                )}
                <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>
              <SocialShare
                config={{
                  url: window.location.href,
                  title: article.title,
                  description: article.content.substring(0, 160),
                }}
              />
            </div>
          </div>
        </article>

        {/* Comments Section (Facebook-style) */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm">
              {totalComments(comments)}
            </div>
          </div>

          {user ? (
            <div className="mb-8">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e: any) => setCommentText(e.target.value)}
                    className="min-h-[60px] bg-transparent border-0 p-0 focus:ring-0 text-sm"
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          postComment();
                        }
                      }
                    }}
                  />
                  {commentText.trim() && (
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={postComment}
                        disabled={!commentText.trim() || isPostingComment}
                        size="sm"
                        className="text-xs h-7"
                      >
                        {isPostingComment ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl text-center border border-blue-200">
              <User className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <p className="text-lg font-semibold text-blue-900 mb-2">
                Join the conversation
              </p>
              <p className="text-blue-700 mb-4 text-sm">
                Sign in to share your thoughts
              </p>
              <Button
                onClick={() => alert("Please implement login functionality")}
                size="sm"
              >
                Sign In
              </Button>
            </div>
          )}

          <div>
            {isLoadingComments ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600 font-medium">
                  Loading comments...
                </p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-xl font-semibold mb-2">
                  No comments yet
                </p>
                <p className="text-gray-400">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    user={user}
                    token={token}
                    onReply={postReply}
                    onEdit={startEdit}
                    onDelete={deleteComment}
                    onLike={toggleCommentLike}
                    isDeleting={isDeleting}
                    isPostingReply={isPostingReply}
                    editingComment={editingComment}
                    editText={editText}
                    setEditText={setEditText}
                    isUpdating={isUpdating}
                    cancelEdit={cancelEdit}
                    showReplyInput={showReplyInput}
                    replyTexts={replyTexts}
                    setReplyTexts={setReplyTexts}
                    setShowReplyInput={setShowReplyInput}
                    onLoadReplies={loadReplies}
                    isLoadingReplies={isLoadingReplies}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
