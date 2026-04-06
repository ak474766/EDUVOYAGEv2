"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "../../../@/components/ui/sidebar";
import axios from "axios";
import { Bell } from "lucide-react";
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

  // Function to get dynamic title based on current path
  const getDynamicTitle = () => {
    if (pathname.includes("/explore")) {
      return { title: "Explore Courses", icon: "🔍" };
    } else if (pathname.includes("/ai-tools")) {
      return { title: "AI Tools", icon: "🤖" };
    } else if (pathname.includes("/view-course")) {
      return { title: "View Course Details", icon: "📖" };
    } else if (pathname.includes("/billing")) {
      return { title: "Billing", icon: "💳" };
    } else if (pathname.includes("/profile")) {
      return { title: "Profile", icon: "👤" };
    } else if (pathname.includes("/my-learning")) {
      return { title: "My Learning", icon: "📚" };
    } else if (pathname.includes("/edit-course")) {
      return { title: "Edit Course", icon: "✏️" };
    } else if (pathname.includes("/notifications")) {
      return { title: "Notifications", icon: "🔔" };
    } else {
      return { title: "Dashboard", icon: "📊" };
    }
  };

  const { title, icon } = getDynamicTitle();

  return (
    <div className="sticky top-0 z-40 p-4 sm:p-5 md:p-6 flex justify-between items-center bg-sidebar/70 supports-[backdrop-filter]:bg-sidebar/50 backdrop-blur-md border-b border-sidebar-border/50 shadow-sm group relative">
      {/* Subtle animated background pattern */}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>

      {!hideSidebar && (
        <div className="relative z-10">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-10" />
          <div className="opacity-60 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 p-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20">
            <SidebarTrigger />
          </div>
        </div>
      )}

      <div className="flex-1 px-2 sm:px-4 md:px-8 relative z-10">
        {/* Title row */}
        <div className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight text-sidebar-foreground">
          <span className="text-xl md:text-2xl">{icon}</span>
          <span className="text-gradient">{title}</span>
        </div>

        {/* Welcome message moved to WelcomeBanner */}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-5 relative z-10">
        {/* Theme toggle */}
        <ThemeToggleButton />
        {/* Notifications */}
        <NotificationToggle />

        {/* User */}
        <div className="relative">
          <div className="p-0.5 rounded-lg glass border-soft shadow-soft transition-all duration-200 hover:shadow-md hover:bg-white/60">
            <UserButton />
          </div>
        </div>
      </div>

      {/* Decorative rules */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/15 dark:via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/15 to-transparent" />
    </div>
  );
}

export default AppHeader;
