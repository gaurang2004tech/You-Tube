import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";
import PlansModal from "./PlansModal";
import { Crown } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { user, setUserPlan } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link href={href} onClick={onClose}>
      <Button variant="ghost" className="w-full justify-start">
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </Button>
    </Link>
  );

  return (
    <nav className="space-y-1 px-2 py-2">
      {onClose && (
        <div className="flex justify-end mb-1 md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      <NavLink href="/" icon={Home} label="Home" />
      <NavLink href="/explore" icon={Compass} label="Explore" />
      <NavLink href="/subscriptions" icon={PlaySquare} label="Subscriptions" />

      {user && (
        <>
          <div className="border-t pt-2 mt-2">
            <NavLink href="/history" icon={History} label="History" />
            <NavLink href="/liked" icon={ThumbsUp} label="Liked videos" />
            <NavLink href="/watch-later" icon={Clock} label="Watch later" />
            <NavLink href="/downloads" icon={Download} label="Downloads" />
            {user?.channelname ? (
              <NavLink href={`/channel/${user._id}`} icon={User} label="Your channel" />
            ) : (
              <div className="px-2 py-1.5">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>
                  Create Channel
                </Button>
              </div>
            )}
          </div>
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
      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
      {user && (
        <PlansModal
          isOpen={plansModalOpen}
          onClose={() => setPlansModalOpen(false)}
          userId={user._id}
          userEmail={user.email}
          onUpgradeSuccess={(newPlan) => setUserPlan(newPlan)}
        />
      )}
    </nav>
  );
};

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-56 bg-white dark:bg-zinc-950 border-r dark:border-zinc-800 min-h-screen transition-colors duration-300 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger Button (floating, top-left) */}
      <button
        className="md:hidden fixed top-[52px] left-2 z-50 bg-white dark:bg-zinc-900 rounded-full p-1.5 shadow-md border dark:border-zinc-700"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Dimmed background */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          {/* Slide-in panel */}
          <aside className="relative w-72 bg-white dark:bg-zinc-950 min-h-screen overflow-y-auto shadow-xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
