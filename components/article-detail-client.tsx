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
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
  useLazyGetCommentRepliesQuery,
  useLikeArticleMutation,
  useLikeCommentMutation,
  useReactToCommentMutation,
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

type ArticleStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

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
  is_featured?: boolean;
  is_breaking?: boolean;
  reading_time_minutes?: number | null;
  tags?: any[];
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
  onReact,
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

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${avatar}`;
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
        {getAvatarUrl(comment.user?.avatar) ? (
          <img
            src={getAvatarUrl(comment.user?.avatar)!}
            alt={comment.user?.name || ""}
            className={`${depth > 0 ? "w-8 h-8" : "w-10 h-10"} rounded-full object-cover flex-shrink-0 shadow-md`}
          />
        ) : (
          <div
            className={`${depth > 0 ? "w-8 h-8" : "w-10 h-10"} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 bg-gradient-to-br ${getAvatarColor(
              comment.user?.id || 0,
            )} shadow-md`}
          >
            <span className={depth > 0 ? "text-xs" : "text-sm"}>
              {getInitials(comment.user?.name)}
            </span>
          </div>
        )}

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
              className={`bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full ${isDeletingThis ? "opacity-50" : ""
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

          {/* Action Buttons with Emoji Reactions */}
          {!isEditing && !isDeletingThis && (
            <div className="flex flex-col gap-1 mt-1 px-3">
              {/* Emoji Reactions Display */}
              {comment.reactions && comment.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {Object.entries(
                    (comment.reactions as { emoji: string; user_id: number }[]).reduce((acc: Record<string, number>, r) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition"
                      onClick={() => onReact && onReact(comment.id, emoji)}
                    >
                      {emoji} <span className="font-medium text-blue-700">{count as number}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                {/* Emoji Reaction Picker */}
                <div className="relative group">
                  <button
                    className="text-gray-600 hover:text-blue-600 transition"
                    disabled={!user}
                  >
                    React
                  </button>
                  <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 gap-1 z-50">
                    {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => onReact && onReact(comment.id, emoji)}
                        className="text-lg hover:scale-125 transition-transform duration-150 p-0.5"
                        disabled={!user}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

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
              {getAvatarUrl(user.avatar) ? (
                <img
                  src={getAvatarUrl(user.avatar)!}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-md"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 bg-gradient-to-br ${getAvatarColor(
                    user.id,
                  )} shadow-md text-xs`}
                >
                  {getInitials(user.name)}
                </div>
              )}
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

// Follow Button Component
function FollowButton({ authorId }: { authorId: number }) {
  const { data: statusData } = useGetFollowStatusQuery(authorId);
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const isFollowed = statusData?.data?.is_following ?? false;
  const loading = isFollowing || isUnfollowing;

  const handleClick = async () => {
    if (isFollowed) {
      await unfollowUser(authorId);
    } else {
      await followUser(authorId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isFollowed
        ? "bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300"
        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "..." : isFollowed ? "Following" : "Follow"}
    </button>
  );
}

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
  const [reactToCommentMutation] = useReactToCommentMutation();

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
      viewArticle({ id: article.id }).catch((error) =>
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

  const reactToComment = async (commentId: number, emoji: string) => {
    if (!user) {
      alert("Please login to react");
      return;
    }
    try {
      await reactToCommentMutation({ commentId, emoji }).unwrap();
    } catch (error: any) {
      console.error("Error reacting to comment:", error);
    }
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

  const getAvatarUrl = (avatar?: string | null) => {
    if (!avatar) return null;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${avatar}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
        {/* Article */}
        <article className="bg-card rounded-2xl shadow-sm overflow-hidden mb-10 border">
          {/* Hero Image */}
          {article.thumbnail && (
            <div className="relative aspect-[2/1] overflow-hidden">
              <img
                src={
                  article.thumbnail.startsWith("http")
                    ? article.thumbnail
                    : `${API_URL.replace("/api", "")}/storage/${article.thumbnail}`
                }
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {article.category?.name || "Uncategorized"}
              </span>
              {article.is_featured && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm">
                  ⭐ Featured
                </span>
              )}
              {article.is_breaking && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium text-sm">
                  🔴 Breaking
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b">
              <div className="flex items-center gap-3">
                {getAvatarUrl(article.author?.avatar) ? (
                  <img
                    src={getAvatarUrl(article.author?.avatar)!}
                    alt={article.author?.name || ""}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-border">
                    {getInitials(article.author?.name || "")}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {article.author?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(article.created_at)}
                    </span>
                    {article.reading_time_minutes && (
                      <span>· {article.reading_time_minutes} min read</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {user && article.author_id !== user.id && (
                  <FollowButton authorId={article.author_id} />
                )}
                {!user && (
                  <a
                    href="/login"
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200"
                  >
                    Follow
                  </a>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <div className="text-foreground/90 text-[17px] leading-[1.8] whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b">
                {article.tags.map((tag: any) => (
                  <span key={tag.id} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex flex-wrap items-center gap-3 py-4">
              <button
                onClick={toggleArticleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${liked
                    ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950 dark:border-red-800"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user || isLiking}
              >
                {isLiking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                )}
                <span>{likes}</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{totalComments(comments)}</span>
              </button>

              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${bookmarked
                    ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!user || isBookmarking}
              >
                {isBookmarking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                )}
                <span>{bookmarked ? "Saved" : "Save"}</span>
              </button>

              <div className="ml-auto">
                <SocialShare
                  config={{
                    url: typeof window !== "undefined" ? window.location.href : "",
                    title: article.title,
                    description: article.content.substring(0, 160),
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-card rounded-2xl shadow-sm p-6 sm:p-8 border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">Comments</h3>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
              {totalComments(comments)}
            </span>
          </div>

          {/* Comment Input */}
          {user ? (
            <div className="mb-6">
              <div className="flex gap-3">
                {getAvatarUrl(user.avatar) ? (
                  <img
                    src={getAvatarUrl(user.avatar)!}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="flex-1 bg-muted rounded-2xl px-4 py-3">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e: any) => setCommentText(e.target.value)}
                    className="min-h-[50px] bg-transparent border-0 p-0 focus:ring-0 text-sm resize-none"
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
                    onReact={reactToComment}
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
