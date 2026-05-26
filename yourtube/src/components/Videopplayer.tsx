"use client";
import { useRef, useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import UpgradeOverlay from "./UpgradeOverlay";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onNext?: () => void;
  onShowComments?: () => void;
}

// Watch-time limits per plan (seconds)
const WATCH_LIMITS: Record<string, number> = {
  free: 5 * 60,   // 5 min
  bronze: 7 * 60,   // 7 min
  silver: 10 * 60,  // 10 min
  gold: Infinity, // unlimited
};

export default function VideoPlayer({ video, onNext, onShowComments }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, setUserPlan } = useUser();
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Gesture state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  const plan = user?.plan ?? "free";
  const limitSeconds = WATCH_LIMITS[plan] ?? 5 * 60;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


  // Reset overlay state when video changes
  useEffect(() => {
    setShowOverlay(false);
    setHasTriggered(false);
  }, [video._id]);

  // Re-check limit when user plan changes (after upgrade)
  useEffect(() => {
    if (hasTriggered && WATCH_LIMITS[user?.plan ?? "free"] === Infinity) {
      setShowOverlay(false);
      setHasTriggered(false);
      videoRef.current?.play();
    }
  }, [user?.plan]);

  const handleTimeUpdate = () => {
    if (hasTriggered) return;
    const current = videoRef.current?.currentTime ?? 0;
    if (current >= limitSeconds && limitSeconds !== Infinity) {
      videoRef.current?.pause();
      setShowOverlay(true);
      setHasTriggered(true);
    }
  };

  const handleUpgrade = (newPlan: string) => {
    setUserPlan(newPlan);
    setShowOverlay(false);
    setHasTriggered(false);
    // Resume video if new plan allows more time
    const newLimit = WATCH_LIMITS[newPlan] ?? 0;
    const current = videoRef.current?.currentTime ?? 0;
    if (current < newLimit || newLimit === Infinity) {
      videoRef.current?.play();
    }
  };

  const handleGestureClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const zone = x < width / 3 ? "left" : x < (width * 2) / 3 ? "center" : "right";

    const now = Date.now();
    let currentTapCount = (now - lastTapTime < 300) ? tapCount + 1 : 1;

    setTapCount(currentTapCount);
    setLastTapTime(now);

    if (tapTimer.current) clearTimeout(tapTimer.current);

    tapTimer.current = setTimeout(() => {
      executeGesture(currentTapCount, zone);
      setTapCount(0);
    }, 300);
  };

  const showHud = (msg: string) => {
    setHudMessage(msg);
    setTimeout(() => setHudMessage(null), 1000);
  };

  const executeGesture = (count: number, zone: "left" | "center" | "right") => {
    if (!videoRef.current) return;

    if (count === 1) {
      if (zone === "center") {
        if (videoRef.current.paused) {
          videoRef.current.play();
          showHud("▶️ Play");
        } else {
          videoRef.current.pause();
          showHud("⏸️ Pause");
        }
      }
    } else if (count === 2) {
      if (zone === "left") {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        showHud("⏪ -10s");
      } else if (zone === "right") {
        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        showHud("⏩ +10s");
      }
    } else if (count === 3) {
      if (zone === "center") {
        showHud("⏭️ Next Video");
        onNext?.();
      } else if (zone === "left") {
        showHud("💬 Scrolling to Comments");
        onShowComments?.();
      } else if (zone === "right") {
        showHud("🏠 Closing Player...");
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
      {/* Gesture Overlay (Top 85% to avoid blocking controls) */}
      <div
        className="absolute top-0 left-0 right-0 h-[85%] z-10 cursor-pointer"
        onClick={handleGestureClick}
      />

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        onTimeUpdate={handleTimeUpdate}
      >
        <source
          src={`${backendUrl}/${video?.filepath?.replace(/\\/g, "/")}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* HUD Message */}
      {hudMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            {hudMessage}
          </div>
        </div>
      )}

      {/* Upgrade Overlay */}
      {showOverlay && user && (
        <UpgradeOverlay
          expiredPlan={plan}
          userId={user._id}
          userEmail={user.email ?? ""}
          onUpgrade={handleUpgrade}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
