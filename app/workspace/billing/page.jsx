"use client";
import { PricingTable } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import SubscriptionSync from "../_components/SubscriptionSync";
import LoadingSpinner from "../../../components/ui/loading";

function Billing() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading billing information..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-8">
          {/* Title removed; AppHeader provides the page title */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-sm">
            <PricingTable />
          </div>
          <div className="mt-8">
            <SubscriptionSync />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;
