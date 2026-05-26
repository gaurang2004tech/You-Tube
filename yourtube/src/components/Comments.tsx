"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import {
  ThumbsUp,
  ThumbsDown,
  Globe,
  MapPin,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  city?: string;
  likes: string[];
  dislikes: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9 .,!?'"\-\n\u0900-\u097F\u0600-\u06FF\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uAC00-\uD7A3]/;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
];

// ─── Translation helper (Google Translate unofficial API) ─────────────────────
async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Response shape: [ [ ["translated","original",...], ... ], ... ]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0]
        .map((chunk: any[]) => chunk[0] ?? "")
        .join("");
    }
    return text;
  } catch {
    return text;
  }
}

// ─── Sub-component: TranslateDropdown ────────────────────────────────────────
const TranslateDropdown = ({
  onSelect,
}: {
  onSelect: (code: string, label: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
        title="Translate comment"
      >
        <Globe size={13} />
        Translate
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute z-50 top-6 left-0 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 min-w-[130px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelect(lang.code, lang.label);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sub-component: CommentCard ───────────────────────────────────────────────
const CommentCard = ({
  comment,
  userId,
  onEdit,
  onDelete,
  onLike,
  onDislike,
}: {
  comment: Comment;
  userId?: string;
  onEdit: (c: Comment) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
}) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transLang, setTransLang] = useState("");

  const hasLiked = userId
    ? comment.likes?.some((id) => id.toString() === userId)
    : false;
  const hasDisliked = userId
    ? comment.dislikes?.some((id) => id.toString() === userId)
    : false;

  const handleTranslate = async (code: string, label: string) => {
    if (isTranslating) return;
    setIsTranslating(true);
    setTransLang(label);
    const result = await translateText(comment.commentbody, code);
    setTranslatedText(result);
    setIsTranslating(false);
  };

  return (
    <div className="flex gap-3 group">
      <Avatar className="w-9 h-9 mt-0.5 shrink-0">

        <AvatarFallback className="text-sm font-medium">
          {comment.usercommented?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
          <span className="font-semibold text-sm">{comment.usercommented}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(comment.commentedon))} ago
          </span>
          {comment.city && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
              <MapPin size={11} />
              {comment.city}
            </span>
          )}
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed">
          {translatedText ?? comment.commentbody}
        </p>
        {translatedText && (
          <span className="text-xs text-gray-400 italic">
            Translated to {transLang} ·{" "}
            <button
              className="underline hover:text-blue-500"
              onClick={() => {
                setTranslatedText(null);
                setTransLang("");
              }}
            >
              Show original
            </button>
          </span>
        )}

        {/* Actions Row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {/* Like */}
          <button
            onClick={() => userId && onLike(comment._id)}
            disabled={!userId}
            className={`flex items-center gap-1 transition-colors ${hasLiked
              ? "text-blue-600 font-semibold"
              : "hover:text-blue-500"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Like"
          >
            <ThumbsUp size={13} />
            <span>{comment.likes?.length ?? 0}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => userId && onDislike(comment._id)}
            disabled={!userId}
            className={`flex items-center gap-1 transition-colors ${hasDisliked
              ? "text-red-500 font-semibold"
              : "hover:text-red-400"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Dislike (comment is removed after 2 dislikes)"
          >
            <ThumbsDown size={13} />
            <span>{comment.dislikes?.length ?? 0}</span>
          </button>

          {/* Translate */}
          {isTranslating ? (
            <span className="text-xs text-gray-400 italic">Translating…</span>
          ) : (
            <TranslateDropdown onSelect={handleTranslate} />
          )}

          {/* Owner actions */}
          {comment.userid === userId && (
            <>
              <button
                onClick={() => onEdit(comment)}
                className="hover:text-foreground transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(comment._id)}
                className="hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Comments = ({ videoId }: { videoId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState("");
  const { user } = useUser();

  // ── Fetch user city once ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("http://ip-api.com/json?fields=city")
      .then((r) => r.json())
      .then((d) => {
        if (d.city) setUserCity(d.city);
      })
      .catch(() => { });
  }, []);

  // ── Load comments ─────────────────────────────────────────────────────────
  const loadComments = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ── Submit new comment ────────────────────────────────────────────────────
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    if (SPECIAL_CHAR_REGEX.test(newComment)) {
      toast.error("Special characters are not allowed in comments.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        city: userCity,
      });
      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: res.data.data?._id ?? Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
          city: userCity,
          likes: [],
          dislikes: [],
        };
        setComments((prev) => [newCommentObj, ...prev]);
        setNewComment("");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Error posting comment.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit comment ──────────────────────────────────────────────────────────
  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    if (SPECIAL_CHAR_REGEX.test(editText)) {
      toast.error("Special characters are not allowed in comments.");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ── Delete comment ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ── Like comment ──────────────────────────────────────────────────────────
  const handleLike = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/like/${id}`, {
        userId: user._id,
      });
      if (res.data) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id !== id) return c;
            const alreadyLiked = c.likes.some(
              (uid) => uid.toString() === user._id
            );
            const newLikes = alreadyLiked
              ? c.likes.filter((uid) => uid.toString() !== user._id)
              : [...c.likes, user._id];
            const newDislikes = c.dislikes.filter(
              (uid) => uid.toString() !== user._id
            );
            return { ...c, likes: newLikes, dislikes: newDislikes };
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ── Dislike comment ───────────────────────────────────────────────────────
  const handleDislike = async (id: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/comment/dislike/${id}`, {
        userId: user._id,
      });
      if (res.data.deleted) {
        // Auto-remove from UI
        setComments((prev) => prev.filter((c) => c._id !== id));
        toast.info("Comment removed after receiving 2 dislikes.");
        return;
      }
      if (res.data) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id !== id) return c;
            const alreadyDisliked = c.dislikes.some(
              (uid) => uid.toString() === user._id
            );
            const newDislikes = alreadyDisliked
              ? c.dislikes.filter((uid) => uid.toString() !== user._id)
              : [...c.dislikes, user._id];
            const newLikes = c.likes.filter(
              (uid) => uid.toString() !== user._id
            );
            return { ...c, dislikes: newDislikes, likes: newLikes };
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-zinc-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="comments-section" className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {/* ── New Comment Input ─────────────────────────────────────────────── */}
      {user ? (
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {userCity && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin size={11} /> Commenting from <strong>{userCity}</strong>
              </p>
            )}
            <Textarea
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(e.target.value)
              }
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting…" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Sign in to leave a comment.
        </p>
      )}

      {/* ── Comment List ──────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) =>
            editingCommentId === comment._id ? (
              /* Inline Edit Mode */
              <div key={comment._id} className="flex gap-3">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback>
                    {comment.usercommented?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleUpdateComment}
                      disabled={!editText.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <CommentCard
                key={comment._id}
                comment={comment}
                userId={user?._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            )
          )
        )}
      </div>
    </div>
  );
};

export default Comments;
