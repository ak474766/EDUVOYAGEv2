"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../../../components/ui/loading";
import EditCourse from "../../edit-course/[courseId]/page";

function ViewCourse() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading course view..." />;
  }

  return (
    <div>
      <EditCourse viewCourse={true} />
    </div>
  );
}

export default ViewCourse;
