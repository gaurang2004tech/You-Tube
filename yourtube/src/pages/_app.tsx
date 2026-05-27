import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { ThemeLocationProvider } from "@/lib/ThemeLocationContext";
import { CommunicationProvider } from "../lib/CommunicationContext";
import VideoCallOverlay from "@/components/VideoCallOverlay";
import Link from "next/link";
import { Home, Compass, History, Download } from "lucide-react";

// Mobile bottom navigation bar
const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white dark:bg-zinc-950 border-t dark:border-zinc-800 py-2">
    <Link href="/" className="flex flex-col items-center flex-1 text-xs gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
      <Home className="w-5 h-5" />
      <span>Home</span>
    </Link>
    <Link href="/search" className="flex flex-col items-center flex-1 text-xs gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
      <Compass className="w-5 h-5" />
      <span>Search</span>
    </Link>
    <Link href="/history" className="flex flex-col items-center flex-1 text-xs gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
      <History className="w-5 h-5" />
      <span>History</span>
    </Link>
    <Link href="/downloads" className="flex flex-col items-center flex-1 text-xs gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
      <Download className="w-5 h-5" />
      <span>Downloads</span>
    </Link>
  </nav>
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeLocationProvider>
      <UserProvider>
        <CommunicationProvider>
          <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-50 transition-colors duration-300">
            <title>Your-Tube Clone</title>
            <Header />
            <Toaster />
            <div className="flex">
              <Sidebar />
              {/* pb-16 on mobile to avoid content hiding behind bottom nav */}
              <main className="flex-1 min-w-0 pb-16 md:pb-0">
                <Component {...pageProps} />
              </main>
            </div>
            <VideoCallOverlay />
            <BottomNav />
          </div>
        </CommunicationProvider>
      </UserProvider>
    </ThemeLocationProvider>
  );
}
