"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationToggle from "./NotificationToggle";
import ThemeToggleButton from "../../../components/ui/theme-toggle-button";

function CourseHeader({ courseInfo }) {
  const [profile, setProfile] = useState({ name: "", plan: "" });
  const router = useRouter();

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

  const handleBack = () => {
    router.push("/workspace");
  };

  // Get course name from courseInfo (prefer courseJson.course.name)
  const courseName =
    courseInfo?.course?.courseJson?.course?.name ||
    courseInfo?.course?.name ||
    "Course Learning";

  return (
    <div className="p-6 flex justify-between items-center shadow-lg backdrop-blur-md text-foreground bg-white/60 dark:bg-white/5 border-b border-white/10 dark:border-white/10 group relative">
      {/* Subtle animated background pattern */}

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>

      {/* Left side - Brand block (acts like back button) */}
      <div className="relative z-10">
        <div
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBack();
          }}
          className="cursor-pointer flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          title="Go to Workspace"
        >
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white ring-1 ring-black/10 shadow-md shadow-black/10">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">EduVoyage logo</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold leading-5 text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                EduVoyage
              </span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Learning platform
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 relative z-10">
        {/* Title row */}
        <div className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight justify-center">
          <span className="text-xl md:text-2xl">📚</span>
          <span className="text-gradient">{courseName}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-5 relative z-10">
        {/* Notifications */}
        <NotificationToggle />

        {/* Theme toggle */}
        <ThemeToggleButton />

        {/* User */}
        <div className="relative">
          <div className="p-0.5 rounded-lg glass border-soft shadow-soft transition-all duration-200 hover:shadow-md hover:bg-white/60 dark:hover:bg-white/10">
            <UserButton />
          </div>
        </div>
      </div>

      {/* Decorative rules */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--accent)]/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--primary)]/45 to-transparent" />
    </div>
  );
}

export default CourseHeader;
