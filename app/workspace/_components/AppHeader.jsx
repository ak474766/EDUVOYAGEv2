"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "../../../@/components/ui/sidebar";
import axios from "axios";
import { Bell, Moon, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import NotificationToggle from "./NotificationToggle";
import ThemeToggleButton from "../../../components/ui/theme-toggle-button";

function AppHeader({ hideSidebar = false }) {
  const [profile, setProfile] = useState({ name: "", plan: "" });
  const pathname = usePathname();

  useEffect(() => {
    let ignore = false;
    axios
      .get("/api/user")
      .then((res) => {
        if (!ignore) setProfile(res.data ?? { name: "", plan: "" });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-ev-surface/80 dark:bg-[#191c1a]/80 backdrop-blur-3xl sticky top-0 z-40">
      {/* Left: Sidebar trigger + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {!hideSidebar && (
          <div className="opacity-60 hover:opacity-100 transition-all duration-300">
            <SidebarTrigger />
          </div>
        )}
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ev-outline" />
          <input
            className="w-full pl-12 pr-6 py-3 bg-ev-surface-container-high dark:bg-ev-surface-container border-none rounded-full text-xs font-medium tracking-widest uppercase placeholder:text-ev-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none text-ev-on-surface"
            placeholder="SEARCH FOR COURSES..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-6 ml-8">
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationToggle />
          {/* Theme toggle */}
          <ThemeToggleButton />
        </div>

        {/* User profile divider + info */}
        <div className="flex items-center gap-3 pl-6 border-l border-ev-outline-variant/20">
          <div className="text-right">
            <p className="text-xs font-bold tracking-tight text-ev-on-surface">
              {profile?.name || "Guest"}
            </p>
            <p className="text-[10px] text-ev-outline tracking-wider uppercase">
              {profile?.plan || "Free"} Learner
            </p>
          </div>
          <div className="p-0.5 rounded-full border-2 border-ev-primary-container">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
