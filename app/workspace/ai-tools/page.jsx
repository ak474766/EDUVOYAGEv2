"use client";
import React, { useState, useEffect } from "react";
import AiTools from "../_components/AiTools";
import LoadingSpinner from "../../../components/ui/loading";

function AITools() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading AI tools..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-xl p-0">
        {/* AiTools already manages internal padding and layout */}
        <AiTools />
      </div>
    </div>
  );
}

export default AITools;
