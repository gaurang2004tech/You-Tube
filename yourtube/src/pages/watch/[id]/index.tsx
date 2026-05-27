import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchvideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosInstance.get("/video/getall");
        const all = res.data ?? [];
        const found = all.find((vid: any) => vid._id === id);
        setCurrentVideo(found ?? null);
        setAllVideos(all);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [id]);

  const handleNextVideo = () => {
    if (!currentVideo || allVideos.length === 0) return;
    const currentIndex = allVideos.findIndex((v: any) => v._id === currentVideo._id);
    if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
      const nextId = allVideos[currentIndex + 1]._id;
      router.push(`/watch/${nextId}`);
    } else if (allVideos.length > 0) {
      // Loop back to first video if at end
      router.push(`/watch/${allVideos[0]._id}`);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById("comments-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  // const relatedVideos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 1250,
  //     Dislike: 50,
  //     views: 45000,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochanel: "Chef's Kitchen",
  //     Like: 890,
  //     Dislike: 20,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];
  if (loading) {
    return <div>Loading..</div>;
  }

  if (!currentVideo) {
    return <div>Video not found</div>;
  }
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-2 md:p-4">
        {/* Mobile: stack vertically. Desktop: side-by-side grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left column: player + info + comments */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <Videopplayer
              video={currentVideo}
              onNext={handleNextVideo}
              onShowComments={scrollToComments}
            />
            <VideoInfo video={currentVideo} />
            <Comments videoId={id as string} />
          </div>
          {/* Right column: related videos (shows below on mobile) */}
          <div className="space-y-4">
            <RelatedVideos videos={allVideos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
