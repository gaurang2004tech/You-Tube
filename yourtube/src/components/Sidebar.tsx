import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import PlansModal from "./PlansModal";
import { Crown } from "lucide-react";

const Sidebar = () => {
  const { user, setUserPlan } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r dark:border-zinc-800 min-h-screen p-2 transition-colors duration-300">
      <nav className="space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>
        <Link href="/explore">
          <Button variant="ghost" className="w-full justify-start">
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>
        <Link href="/subscriptions">
          <Button variant="ghost" className="w-full justify-start">
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>

        {user && (
          <>
            <div className="border-t pt-2 mt-2">
              <Link href="/history">
                <Button variant="ghost" className="w-full justify-start">
                  <History className="w-5 h-5 mr-3" />
                  History
                </Button>
              </Link>
              <Link href="/liked">
                <Button variant="ghost" className="w-full justify-start">
                  <ThumbsUp className="w-5 h-5 mr-3" />
                  Liked videos
                </Button>
              </Link>
              <Link href="/watch-later">
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="w-5 h-5 mr-3" />
                  Watch later
                </Button>
              </Link>
              <Link href="/downloads">
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="w-5 h-5 mr-3" />
                  Downloads
                </Button>
              </Link>
              {user?.channelname ? (
                <Link href={`/channel/${user.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-5 h-5 mr-3" />
                    Your channel
                  </Button>
                </Link>
              ) : (
                <div className="px-2 py-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setisdialogeopen(true)}
                  >
                    Create Channel
                  </Button>
                </div>
              )}
            </div>

            {/* Upgrade Plan Button */}
            <div className="px-2 mt-4 pt-4 border-t">
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium shadow-sm transition-all"
                onClick={() => setPlansModalOpen(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                {user.plan === "gold" ? "Manage Plan" : "Upgrade Plan"}
              </Button>
            </div>
          </>
        )}
      </nav>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
      {user && (
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
          userId={user._id}
          userEmail={user.email}
          onUpgradeSuccess={(newPlan) => setUserPlan(newPlan)}
        />
      )}
    </aside>
  );
};

export default Sidebar;
