"use client";
import { Bell, Menu, Mic, Search, User, VideoIcon, Phone, X, ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import AuthOtpModal from "./AuthOtpModal";
import UsersList from "./UsersList";

const Header = () => {
  const { user, logout } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUsersListOpen, setIsUsersListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(e as any);
  };

  // Mobile search overlay
  if (mobileSearchOpen) {
    return (
      <header className="flex items-center gap-2 px-2 py-2 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 transition-colors duration-300 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(false)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-1">
          <div className="flex flex-1">
            <Input
              type="search"
              placeholder="Search YouTube"
              value={searchQuery}
              autoFocus
              onKeyPress={handleKeypress}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-l-full border-r-0 focus-visible:ring-0"
            />
            <Button type="submit" className="rounded-r-full px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-l-0">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-2 md:px-4 py-2 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 transition-colors duration-300 sticky top-0 z-40">
      {/* Left: Logo */}
      <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Menu className="w-6 h-6" />
        </Button>
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-lg md:text-xl font-medium">YourTube</span>
          <span className="text-xs text-gray-400 ml-0.5 hidden sm:inline">IN</span>
        </Link>
      </div>

      {/* Center: Search (desktop only) */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-4">
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full border-r-0 focus-visible:ring-0"
          />
          <Button type="submit" className="rounded-r-full px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-l-0">
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile: Search icon */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSearchOpen(true)}>
          <Search className="w-5 h-5" />
        </Button>

        {user ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={`hidden md:flex ${isUsersListOpen ? "text-blue-600 bg-blue-50 dark:bg-blue-500/10" : ""}`}
              onClick={() => setIsUsersListOpen(!isUsersListOpen)}
            >
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="px-2 py-2 text-sm font-medium truncate">{user.name || user.email}</div>
                <DropdownMenuSeparator />
                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setisdialogeopen(true)}>
                      Create Channel
                    </Button>
                  </div>
                )}
                <DropdownMenuItem asChild><Link href="/history">History</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/liked">Liked videos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/watch-later">Watch later</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/downloads">Downloads</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button className="flex items-center gap-1 text-sm" onClick={() => setIsAuthModalOpen(true)}>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        )}
      </div>

      <Channeldialogue isopen={isdialogeopen} onclose={() => setisdialogeopen(false)} mode="create" />
      <AuthOtpModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {isUsersListOpen && <UsersList onClose={() => setIsUsersListOpen(false)} />}
    </header>
  );
};

export default Header;
