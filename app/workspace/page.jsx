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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading workspace..." />;
  }

  return (
    <div className="space-y-12">
      <WelcomeBanner />
      <CourseGenerationStatus />
      <EnrollCourseList />
      <CourseList />
    </div>
  );
}

export default Workspace;
