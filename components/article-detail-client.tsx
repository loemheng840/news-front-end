"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import SocialShare from "./social-share";

// Type definitions
type UserRole = "ADMIN" | "AUTHOR" | "READER";

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
    "rounded-lg font-medium transition inline-flex items-center justify-center";
  const sizeStyles = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantStyles =
    variant === "outline"
      ? "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
      : variant === "ghost"
        ? "bg-transparent hover:bg-gray-100 text-gray-700"
        : variant === "danger"
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed";

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
      className={`w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
      {...props}
    />
  );
};

export default function ArticleDetailClient({ article }: { article: Article }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

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

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  // Initialize auth
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  // Load comments and track view
  useEffect(() => {
    loadComments();
    checkUserLikeStatus();
    checkUserBookmarkStatus();

    // Track view
    if (token) {
      fetch(`${API}/articles/${article.id}/view`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error tracking view:", error));
    }
  }, [article.id, token]);

  const checkUserLikeStatus = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/articles/${article.id}/likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const userLike = data.find((like: any) => like.user_id === user?.id);
        setLiked(!!userLike);
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const checkUserBookmarkStatus = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/user/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const isBookmarked = data.some(
          (bookmark: any) => bookmark.article_id === article.id,
        );
        setBookmarked(isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  // Article like functionality
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

      const method = previousLiked ? "DELETE" : "POST";
      const res = await fetch(`${API}/articles/${article.id}/like`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle like");
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

  // Article bookmark functionality
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

      const method = previousBookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API}/articles/${article.id}/bookmark`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle bookmark");
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

  // Share article functionality
  const shareArticle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy link. Please try again.");
    }
  };

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API}/articles/${article.id}/comments`, {
        headers,
      });

      if (!res.ok) throw new Error("Failed to load comments");

      const data = await res.json();
      setComments(organizeComments(data));
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const organizeComments = (flatComments: any[]): CommentWithEngagement[] => {
    const commentMap: { [key: number]: CommentWithEngagement } = {};
    const rootComments: CommentWithEngagement[] = [];

    // First pass: create all comments with proper structure
    flatComments.forEach((comment: any) => {
      commentMap[comment.id] = {
        ...comment,
        replies: [],
        likes_count: comment.likes_count || 0,
        is_liked: comment.is_liked || false,
        user: comment.user || {
          id: comment.user_id,
          name: article.author?.name,
          email: "",
          role: "READER",
          created_at: "",
          updated_at: "",
        },
      };
    });

    // Second pass: organize into tree structure
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

    try {
      setIsPostingComment(true);
      const res = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: article.id,
          content: commentText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post comment");
      }

      setCommentText("");
      await loadComments(); // Refresh comments
    } catch (error: any) {
      console.error("Error posting comment:", error);
      alert(error.message || "Failed to post comment. Please try again.");
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

    try {
      setIsPostingReply(parentId);
      const res = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: article.id,
          parent_id: parentId,
          content: replyText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post reply");
      }

      setReplyTexts({ ...replyTexts, [parentId]: "" });
      setShowReplyInput(null);
      await loadComments(); // Refresh comments
    } catch (error: any) {
      console.error("Error posting reply:", error);
      alert(error.message || "Failed to post reply. Please try again.");
    } finally {
      setIsPostingReply(null);
    }
  };

  const updateComment = async (commentId: number) => {
    if (!user || !editText.trim()) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`${API}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update comment");
      }

      setEditingComment(null);
      setEditText("");
      await loadComments(); // Refresh comments
    } catch (error: any) {
      console.error("Error updating comment:", error);
      alert(error.message || "Failed to update comment. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      setIsDeleting(commentId);
      const res = await fetch(`${API}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }

      setOpenDropdown(null);

      // Optimistically remove comment from UI
      setComments((prev) => removeCommentFromTree(prev, commentId));
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment. Please try again.");

      // If error, refresh comments to get correct state
      await loadComments();
    } finally {
      setIsDeleting(null);
    }
  };

  // Helper function to remove comment from tree
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
      const method = isLiked ? "DELETE" : "POST";
      const res = await fetch(`${API}/comments/${commentId}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle comment like");
      }

      // Optimistically update UI
      setComments((prev) => updateCommentLike(prev, commentId, !isLiked));
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      alert(error.message || "Failed to update like. Please try again.");
    }
  };

  // Helper function to update comment like status
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
            : comment.likes_count - 1,
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

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
    setOpenDropdown(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const shareConfig = {
    url: window.location.href,
    title: article.title,
    description: article.content.substring(0, 100) + "...",
    hashtags: article.category?.name || "NewsHub",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: CommentWithEngagement;
    depth?: number;
  }) => {
    const isOwner = user?.id === comment.user_id;
    const isEditing = editingComment === comment.id;
    const showingReply = showReplyInput === comment.id;
    const isDropdownOpen = openDropdown === comment.id;
    const isDeletingThis = isDeleting === comment.id;

    return (
      <div
        className={`${
          depth > 0 ? "ml-8 mt-4 border-l-2 border-gray-200 pl-4" : "mt-4"
        }`}
      >
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {comment.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">
                    {comment.user?.name || "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-xs text-gray-400 italic">
                      (edited)
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Edit your comment..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => updateComment(comment.id)}
                        disabled={isUpdating || !editText.trim()}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-1 break-words">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>

            {isOwner && !isEditing && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    setOpenDropdown(isDropdownOpen ? null : comment.id)
                  }
                  disabled={isDeletingThis}
                >
                  {isDeletingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>

                {isDropdownOpen && !isDeletingThis && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => startEdit(comment)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-gray-700"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {!isEditing && !isDeletingThis && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              <button
                onClick={() => toggleCommentLike(comment.id, comment.is_liked)}
                className={`flex items-center gap-1 hover:text-blue-600 transition ${
                  comment.is_liked
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
                disabled={!user}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    comment.is_liked ? "fill-current" : ""
                  }`}
                />
                <span>{comment.likes_count || 0}</span>
              </button>

              <button
                onClick={() =>
                  setShowReplyInput(showingReply ? null : comment.id)
                }
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
                disabled={!user}
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>

              {comment.replies && comment.replies.length > 0 && (
                <span className="text-gray-500">
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </span>
              )}
            </div>
          )}

          {isDeletingThis && (
            <div className="mt-3 text-sm text-gray-500">
              Deleting comment...
            </div>
          )}
        </div>

        {showingReply && user && (
          <div className="ml-8 mt-3 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder={`Reply to ${comment.user?.name || "user"}...`}
                  value={replyTexts[comment.id] || ""}
                  onChange={(e: any) =>
                    setReplyTexts({
                      ...replyTexts,
                      [comment.id]: e.target.value,
                    })
                  }
                  className="min-h-[60px] mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => postReply(comment.id)}
                    disabled={
                      !replyTexts[comment.id]?.trim() ||
                      isPostingReply === comment.id
                    }
                  >
                    {isPostingReply === comment.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Reply
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyInput(null);
                      setReplyTexts({ ...replyTexts, [comment.id]: "" });
                    }}
                    disabled={isPostingReply === comment.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Article Card */}
      <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {article.thumbnail && (
          <img
            src={
              article.thumbnail.startsWith("http")
                ? article.thumbnail
                : `${API?.replace("/api", "")}/storage/${article.thumbnail}`
            }
            alt={article.title}
            className="w-full h-auto object-cover max-h-96"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        )}

        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {article.author?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="font-medium">
                {article.author?.name || "Anonymous"}
              </span>
            </div>
            <span>•</span>
            <span>{formatDate(article.created_at)}</span>
            {article.category && (
              <>
                <span>•</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {article.category.name}
                </span>
              </>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {article.content}
            </p>
          </div>

          {/* Article Engagement Buttons */}
          <div className="flex items-center gap-4 py-4 border-y border-gray-200">
            {/* Like Button */}
            <button
              onClick={toggleArticleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                liked
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!user || isLiking}
              aria-label={liked ? "Unlike article" : "Like article"}
            >
              {isLiking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              )}
              <span className="font-semibold">{likes}</span>
            </button>

            {/* Comment Button */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{totalComments(comments)}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                bookmarked
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!user || isBookmarking}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark article"}
            >
              {isBookmarking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Bookmark
                  className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
                />
              )}
              <span className="font-medium">Bookmark</span>
            </button>
            <SocialShare
              config={shareConfig}
              variant="button" // or "icon" if you want the icon variant
            />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          Comments ({totalComments(comments)})
        </h3>

        {user ? (
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] mb-3"
                />
                <Button
                  onClick={postComment}
                  disabled={!commentText.trim() || isPostingComment}
                >
                  {isPostingComment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center border border-blue-100">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <p className="text-blue-900 font-semibold mb-2">
              Join the conversation
            </p>
            <p className="text-blue-700 text-sm">
              Please login to leave a comment and engage with others
            </p>
          </div>
        )}

        <div className="space-y-4">
          {isLoadingComments ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-gray-400" />
              <p className="mt-4 text-gray-500 font-medium">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                No comments yet
              </p>
              <p className="text-gray-400">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
