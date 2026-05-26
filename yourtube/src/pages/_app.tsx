import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { ThemeLocationProvider } from "@/lib/ThemeLocationContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeLocationProvider>
      <UserProvider>
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-zinc-50 transition-colors duration-300">
          <title>Your-Tube Clone</title>
          <Header />
          <Toaster />
          <div className="flex">
            <Sidebar />
            <Component {...pageProps} />
          </div>
        </div>
      </UserProvider>
    </ThemeLocationProvider>
  );
}
