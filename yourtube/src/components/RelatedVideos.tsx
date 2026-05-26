import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
    filepath?: string;
  }>;
}

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  if (!videos || videos.length === 0) {
    return <p className="text-xs text-gray-500 italic px-1">No related videos found.</p>;
  }

  return (
    <>
      {/* Mobile: horizontal scrolling row */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:hidden scrollbar-hide -mx-2 px-2">
        {videos.map((video) => (
          <Link key={video._id} href={`/watch/${video._id}`} className="flex-shrink-0 w-48 group">
            <div className="relative aspect-video bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden mb-2">
              <video
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <h3 className="font-medium text-xs line-clamp-2 dark:text-zinc-100">{video.videotitle}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{video.videochanel}</p>
          </Link>
        ))}
      </div>

      {/* Desktop: vertical list */}
      <div className="hidden lg:flex flex-col gap-3">
        {videos.map((video) => (
          <Link key={video._id} href={`/watch/${video._id}`} className="flex gap-2 group">
            <div className="relative w-40 aspect-video bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden flex-shrink-0">
              <video
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 dark:text-zinc-100 group-hover:text-blue-600">{video.videotitle}</h3>
              <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">{video.videochanel}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500">
                {video.views?.toLocaleString()} views · {formatDistanceToNow(new Date(video.createdAt))} ago
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
