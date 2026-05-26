import React, { useEffect, useState } from "react";
import { Download, Trash2, RefreshCw, Crown, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import Link from "next/link";
import PlansModal from "@/components/PlansModal";

interface DownloadedVideo {
    _id: string;
    videotitle: string;
    filepath: string;
    filename: string;
    videochanel: string;
    downloadedAt: string;
}

const DownloadsPage = () => {
    const { user, setUserPlan } = useUser();
    const [downloads, setDownloads] = useState<DownloadedVideo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("yt_downloads") || "[]");
        setDownloads(stored);
    }, []);

    const handleReDownload = (video: DownloadedVideo) => {
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const fileUrl = `${backendUrl}/${video.filepath}`;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = video.filename || video.videotitle;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRemove = (id: string) => {
        const updated = downloads.filter((v) => v._id !== id);
        setDownloads(updated);
        localStorage.setItem("yt_downloads", JSON.stringify(updated));
    };

    const handleClearAll = () => {
        setDownloads([]);
        localStorage.removeItem("yt_downloads");
    };

    if (!user) {
        return (
            <div className="flex-1 min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 transition-colors">
                <div className="text-center">
                    <Download size={48} className="mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold mb-2">Sign in to see your downloads</h2>
                    <p className="text-gray-500 text-sm">Your downloaded videos will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight text-gray-900 dark:text-zinc-50">
                            <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                <Download size={24} strokeWidth={2.5} />
                            </div>
                            Downloads
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 font-medium flex items-center gap-2">
                            <span>{downloads.length} video{downloads.length !== 1 ? "s" : ""} saved</span>
                            {user?.isPremium && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700" />
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                                        <Crown size={12} fill="currentColor" />
                                        Premium
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                    {downloads.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-full px-4"
                            onClick={handleClearAll}
                        >
                            <Trash2 size={16} className="mr-2" />
                            Clear all
                        </Button>
                    )}
                </div>

                {/* Free user limit notice */}
                {!user?.isPremium && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Crown size={20} className="text-orange-400 shrink-0" />
                            <div>
                                <p className="font-medium text-sm text-gray-800">
                                    Free plan: 1 download per day
                                </p>
                                <p className="text-xs text-gray-500">
                                    Upgrade to Premium for unlimited downloads
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 shrink-0"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Upgrade ₹99
                        </Button>
                    </div>
                )}

                {/* Download list */}
                {downloads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Video size={48} className="text-gray-300 dark:text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                            No downloads yet
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 max-w-sm mb-8">
                            Save your favorite videos to watch them later even when you're offline.
                        </p>
                        <Link href="/">
                            <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transform hover:scale-105 transition-all shadow-lg shadow-blue-500/25">
                                Explore Videos
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {downloads.map((video) => (
                            <div
                                key={video._id}
                                className="group relative flex items-center gap-5 p-4 bg-gray-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 transition-all rounded-2xl border border-gray-100 dark:border-zinc-800/50 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10"
                            >
                                {/* Thumbnail Area */}
                                <div className="relative w-40 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-zinc-800 dark:to-zinc-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                                    <Video size={28} className="text-blue-400 dark:text-zinc-500" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Link
                                            href={`/watch/${video._id}`}
                                            className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all bg-white/90 dark:bg-zinc-800/90 p-2 rounded-full text-blue-600 dark:text-blue-400 shadow-xl"
                                        >
                                            <Play size={20} fill="currentColor" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link href={`/watch/${video._id}`}>
                                        <h4 className="font-semibold text-gray-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1">
                                            {video.videotitle}
                                        </h4>
                                    </Link>
                                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-1">
                                        {video.videochanel}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Download size={12} />
                                            {formatDistanceToNow(new Date(video.downloadedAt))} ago
                                        </span>
                                    </div>

                                    {/* Action row for mobile-ish or extra link */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <Link href={`/watch/${video._id}`}>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 border-none"
                                            >
                                                Watch Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-1 self-start sm:self-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full"
                                        onClick={() => handleReDownload(video)}
                                        title="Re-download"
                                    >
                                        <RefreshCw size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full"
                                        onClick={() => handleRemove(video._id)}
                                        title="Remove from list"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>

            {user && (
                <PlansModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    userId={user._id}
                    userEmail={user.email}
                    onUpgradeSuccess={(newPlan) => setUserPlan(newPlan)}
                />
            )}
        </div>
    );
};

export default DownloadsPage;
