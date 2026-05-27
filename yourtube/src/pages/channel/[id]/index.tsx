import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVideos = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get(`/video/byuser/${id}`);
        setMyVideos(res.data ?? []);
      } catch (error) {
        console.error("Failed to fetch channel videos:", error);
        setMyVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyVideos();
  }, [id]);

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={user} user={user} />
        <Channeltabs />
        <div className="px-4 pb-8">
          <VideoUploader channelId={id} channelName={user?.channelname} />
        </div>
        <div className="px-4 pb-8">
          {loading ? (
            <p className="text-gray-500">Loading your videos...</p>
          ) : (
            <ChannelVideos videos={myVideos} />
          )}
        </div>
      </div>
    </div>
  );
};

export default index;
