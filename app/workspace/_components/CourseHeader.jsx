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
    <div className="px-6 py-4 flex justify-between items-center shadow-[0px_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl bg-ev-surface/80 dark:bg-[#0f1411]/80 text-ev-on-surface border-b border-ev-outline-variant/30 relative">

      {/* Left side - Brand block (acts like back button) */}
      <div className="relative z-10">
        <div
          onClick={handleBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleBack();
          }}
          className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-full hover:bg-ev-surface-container transition-colors"
          title="Go to Workspace"
        >
          <div className="h-10 w-10 rounded-full grid place-items-center bg-ev-primary text-ev-surface shadow-sm">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">EduVoyage logo</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold leading-5 text-ev-on-surface">
              EduVoyage
            </span>
            <span className="text-xs uppercase tracking-wider text-ev-on-surface-variant font-medium">
              Learning platform
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 relative z-10 hide-scrollbar overflow-x-auto whitespace-nowrap hidden sm:flex justify-center">
        {/* Title row */}
        <div className="text-xl md:text-2xl font-bold flex items-center gap-3 tracking-tight text-ev-on-surface">
          <span className="text-xl md:text-2xl">📚</span>
          <span className="truncate">{courseName}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 md:gap-5 relative z-10">
        {/* Notifications */}
        <NotificationToggle />

        {/* Theme toggle */}
        <ThemeToggleButton />

        {/* User */}
        <div className="p-0.5 rounded-full hover:bg-ev-surface-container transition-colors scale-110">
          <UserButton />
        </div>
      </div>
    </div>
  );
}

export default CourseHeader;
