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
}

// Watch-time limits per plan (seconds)
const WATCH_LIMITS: Record<string, number> = {
  free: 5 * 60,   // 5 min
  bronze: 7 * 60,   // 7 min
  silver: 10 * 60,  // 10 min
  gold: Infinity, // unlimited
};

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, setUserPlan } = useUser();
  const [showOverlay, setShowOverlay] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const plan = user?.plan ?? "free";
  const limitSeconds = WATCH_LIMITS[plan] ?? 5 * 60;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        onTimeUpdate={handleTimeUpdate}
      >
        <source
          src={`${backendUrl}/${video?.filepath}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

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
