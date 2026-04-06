"use client";
import React, { useState, useEffect } from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import EnrollCourseList from "./_components/EnrollCourseList";
import CourseGenerationStatus from "./_components/CourseGenerationStatus";
import LoadingSpinner from "../../components/ui/loading";

const CourseList = React.lazy(() => import("./_components/CourseList"));

function Workspace() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading workspace..." />;
  }

  return (
    <div className="relative">
      {/* Animated gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-500/25 to-purple-500/25 dark:from-blue-400/10 dark:to-purple-400/10 dark:opacity-70 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] right-[-80px] h-80 w-80 rounded-full bg-gradient-to-tl from-indigo-500/20 to-fuchsia-500/20 dark:from-indigo-400/10 dark:to-fuchsia-400/10 dark:opacity-70 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-sky-400/10 to-violet-400/10 dark:from-sky-300/10 dark:to-violet-300/10 dark:opacity-80 blur-2xl animate-pulse" />
      </div>

      {/* Foreground content */}
      <div className="relative space-y-6">
        <WelcomeBanner />
        <CourseGenerationStatus />
        <EnrollCourseList />
        <CourseList />
      </div>
    </div>
  );
}

export default Workspace;
