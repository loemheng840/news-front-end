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
} from "lucide-react";

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
  replies?: Comment[];
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
      className={`w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
};

// Simple Dropdown Menu components
const DropdownMenu = ({ children }: any) => {
  return <div className="relative inline-block">{children}</div>;
};

const DropdownMenuTrigger = ({ children, asChild }: any) => {
  return <div>{children}</div>;
};

const DropdownMenuContent = ({ children, align = "start" }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div
          className={`absolute ${
            align === "end" ? "right-0" : "left-0"
          } mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10`}
        >
          {children}
        </div>
      )}
    </>
  );
};

const DropdownMenuItem = ({ children, onClick, className = "" }: any) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${className}`}
    >
      {children}
    </button>
  );
};

interface CommentWithEngagement extends Comment {
  likes_count: number;
  is_liked: boolean;
  user?: User;
}

export default function ArticleDetailClient({ article }: { article: Article }) {
  // Mock auth - replace with your actual auth logic
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get user and token from localStorage or your auth system
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);
  }, []);

  const [likes, setLikes] = useState(article.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<CommentWithEngagement[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadComments();

    // Track view
    if (token) {
      fetch(`${API}/articles/${article.id}/view`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => console.error("Error tracking view:", error));
    }
  }, [article.id]);

  const loadComments = async () => {
    try {
      setIsLoadingComments(true);
      const res = await fetch(`${API}/articles/${article.id}/comments`);
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
          name: "Anonymous",
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
        commentMap[comment.parent_id].replies!.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const toggleLike = async () => {
    if (!user) {
      alert("Please login to like this article");
      return;
    }

    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(`${API}/articles/${article.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to toggle like");

      setLiked(!liked);
      setLikes((prev: number) => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like. Please try again.");
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please login to bookmark this article");
      return;
    }

    try {
      const method = bookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API}/articles/${article.id}/bookmark`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to toggle bookmark");

      setBookmarked(!bookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Failed to update bookmark. Please try again.");
    }
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
          parent_id: replyTo,
          content: commentText,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setCommentText("");
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
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

      if (!res.ok) throw new Error("Failed to post reply");

      setReplyTexts({ ...replyTexts, [parentId]: "" });
      setShowReplyInput(null);
      await loadComments();
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    }
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

      if (!res.ok) throw new Error("Failed to toggle comment like");

      await loadComments();
    } catch (error) {
      console.error("Error toggling comment like:", error);
      alert("Failed to update like. Please try again.");
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`${API}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      await loadComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const updateComment = async (commentId: number) => {
    if (!user || !editText.trim()) return;

    try {
      const res = await fetch(`${API}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editText }),
      });

      if (!res.ok) throw new Error("Failed to update comment");

      setEditingComment(null);
      setEditText("");
      await loadComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
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

    return (
      <div
        className={`${
          depth > 0 ? "ml-8 mt-4 border-l-2 border-gray-200 pl-4" : "mt-4"
        }`}
      >
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {comment.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {comment.user?.name || "Anonymous"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {isEditing ? (
                  <div className="mt-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => updateComment(comment.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingComment(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                )}
              </div>
            </div>

            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(comment)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              <button
                onClick={() => toggleCommentLike(comment.id, comment.is_liked)}
                className={`flex items-center gap-1 hover:text-blue-600 transition ${
                  comment.is_liked
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
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
        </div>

        {showingReply && user && (
          <div className="ml-8 mt-3 bg-white rounded-lg border p-3">
            <Textarea
              placeholder={`Reply to ${comment.user?.name || "user"}...`}
              value={replyTexts[comment.id] || ""}
              onChange={(e) =>
                setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })
              }
              className="min-h-[60px] mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => postReply(comment.id)}>
                Post Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReplyInput(null);
                  setReplyTexts({ ...replyTexts, [comment.id]: "" });
                }}
              >
                Cancel
              </Button>
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <img
          src={
            article.thumbnail
              ? `${API?.replace("/api", "")}/storage/${article.thumbnail}`
              : "/placeholder.svg"
          }
          alt={article.title}
          className="w-full h-auto object-cover max-h-96"
        />

        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <span>By {article.author?.name || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
            {article.category && (
              <>
                <span>•</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {article.category.name}
                </span>
              </>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              {article.content}
            </p>
          </div>

          <div className="flex items-center gap-6 py-4 border-y border-gray-200">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span className="font-semibold">{likes}</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{comments.length}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                bookmarked
                  ? "bg-yellow-50 text-yellow-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bookmark
                className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </div>
      </article>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          Comments ({comments.length})
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
                  {isPostingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-900">Please login to leave a comment</p>
          </div>
        )}

        <div className="space-y-4">
          {isLoadingComments ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </p>
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
