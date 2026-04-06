"use client";
import { SignUp } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../../../components/ui/loading";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading sign-up form..." />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp />
    </div>
  );
}
