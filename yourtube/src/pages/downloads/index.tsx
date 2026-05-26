import React, { useEffect, useState } from "react";
import { Download, Trash2, RefreshCw, Crown, Video } from "lucide-react";
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Download size={24} />
                            Downloads
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {downloads.length} video{downloads.length !== 1 ? "s" : ""} downloaded
                            {user?.isPremium && (
                                <span className="ml-2 inline-flex items-center gap-1 text-orange-500 font-medium">
                                    <Crown size={13} />
                                    Premium — Unlimited
                                </span>
                            )}
                        </p>
                    </div>
                    {downloads.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleClearAll}
                        >
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
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Video size={56} className="text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">
                            No downloads yet
                        </h3>
                        <p className="text-sm text-gray-400 max-w-xs">
                            Click the Download button on any video to save it here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {downloads.map((video) => (
                            <div
                                key={video._id}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors rounded-xl border border-gray-100 dark:border-zinc-800"
                            >
                                <div className="w-28 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-700 rounded-lg shrink-0 flex items-center justify-center">

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">
                                            {video.videotitle}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {video.videochanel}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Downloaded{" "}
                                            {formatDistanceToNow(new Date(video.downloadedAt))} ago
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => handleReDownload(video)}
                                            title="Re-download"
                                        >
                                            <RefreshCw size={15} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleRemove(video._id)}
                                            title="Remove from list"
                                        >
                                            <Trash2 size={15} />
                                        </Button>
                                    </div>
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
