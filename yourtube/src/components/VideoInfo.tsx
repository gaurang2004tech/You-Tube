import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Crown,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import PlansModal from "./PlansModal";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user, setUserPlan } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosInstance.post(`/history/views/${video?._id}`);
      }
    };
    handleviews();
  }, [user]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ─── Download Handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!user) {
      toast.error("Please sign in to download videos.");
      return;
    }
    setIsDownloading(true);
    try {
      const res = await axiosInstance.post(`/user/download/${user._id}`);
      if (res.data.allowed) {
        // Trigger browser download
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const fileUrl = `${backendUrl}/${video.filepath}`;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = video.filename || video.videotitle || "video";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Save to localStorage downloads list
        const existing = JSON.parse(
          localStorage.getItem("yt_downloads") || "[]"
        );
        const alreadySaved = existing.some((v: any) => v._id === video._id);
        if (!alreadySaved) {
          existing.unshift({
            _id: video._id,
            videotitle: video.videotitle,
            filepath: video.filepath,
            filename: video.filename,
            videochanel: video.videochanel,
            downloadedAt: new Date().toISOString(),
          });
          localStorage.setItem("yt_downloads", JSON.stringify(existing));
        }

        const msg = res.data.isPremium
          ? "✅ Downloading (Premium — unlimited)"
          : "✅ Downloading (1 of 1 free download today)";
        toast.success(msg);
      } else {
        // Daily limit reached — show plans modal
        setShowPlansModal(true);
      }
    } catch (error) {
      console.log(error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 text-black dark:text-white">
        <h1 className="text-xl font-semibold dark:text-zinc-50">{video.videotitle}</h1>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium dark:text-zinc-100">{video.videochanel}</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">1.2M subscribers</p>
            </div>
            <Button className="ml-4 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">Subscribe</Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-l-full dark:hover:bg-zinc-700"
                onClick={handleLike}
              >
                <ThumbsUp
                  className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black dark:fill-white dark:text-white" : "dark:text-zinc-100"
                    }`}
                />
                <span className="dark:text-zinc-100">{likes.toLocaleString()}</span>
              </Button>
              <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700" />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-r-full dark:hover:bg-zinc-700"
                onClick={handleDislike}
              >
                <ThumbsDown
                  className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black dark:fill-white dark:text-white" : "dark:text-zinc-100"
                    }`}
                />
                <span className="dark:text-zinc-100">{dislikes.toLocaleString()}</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`bg-gray-100 dark:bg-zinc-800 rounded-full dark:hover:bg-zinc-700 ${isWatchLater ? "text-primary" : "dark:text-zinc-100"
                }`}
              onClick={handleWatchLater}
            >
              <Clock className="w-5 h-5 mr-2" />
              {isWatchLater ? "Saved" : "Watch Later"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-gray-100 dark:bg-zinc-800 rounded-full dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Share className="w-5 h-5 mr-2" />
              Share
            </Button>

            {/* ── Download Button ── */}
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full font-medium transition-all ${user?.plan === "gold"
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500"
                : "bg-gray-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                }`}
              onClick={handleDownload}
              disabled={isDownloading}
              title={
                user?.plan === "gold"
                  ? "Gold: Unlimited downloads"
                  : "Free/Bronze/Silver: 1 download/day"
              }
            >
              {user?.plan === "gold" ? (
                <Crown className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isDownloading ? "Downloading…" : "Download"}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-100 dark:bg-zinc-800 rounded-full dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 transition-colors">
          <div className="flex gap-4 text-sm font-medium mb-2 dark:text-zinc-100">
            <span>{video.views.toLocaleString()} views</span>
            <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
          </div>
          <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"} dark:text-zinc-300`}>
            <p>
              Sample video description. This would contain the actual video
              description from the database.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 p-0 h-auto font-medium"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Show less" : "Show more"}
          </Button>
        </div>
      </div>

      {/* Plans Modal */}
      {user && (
        <PlansModal
          isOpen={showPlansModal}
          onClose={() => setShowPlansModal(false)}
          userId={user._id}
          userEmail={user.email}
          onUpgradeSuccess={(plan) => setUserPlan(plan)}
          title="Download Limit Reached"
          subtitle="Upgrade your plan to download more videos"
        />
      )}
    </>
  );
};

export default VideoInfo;
