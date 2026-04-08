"use client";
import React, { useState, useEffect, Component } from "react";
import { PricingTable } from "@clerk/nextjs";
import SubscriptionSync from "../_components/SubscriptionSync";
import LoadingSpinner from "../../../components/ui/loading";
import { Crown, Check, Zap } from "lucide-react";

// Error boundary to catch Clerk PricingTable errors when billing is disabled
class PricingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("PricingTable error (billing may be disabled):", error.message);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Billing() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading billing information..." />;
  }

  const fallbackPricing = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Free Plan */}
      <div className="bg-ev-surface-container-low dark:bg-ev-surface-container-high rounded-xl p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-ev-on-surface">Free Plan</h3>
          <p className="text-ev-on-surface-variant text-sm">Get started with basic features</p>
        </div>
        <div className="text-4xl font-extrabold text-ev-on-surface">
          $0<span className="text-base font-normal text-ev-outline">/mo</span>
        </div>
        <ul className="space-y-3">
          {["5 AI-generated courses", "Basic course content", "Community access", "Course certificates"].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-ev-on-surface-variant">
              <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <button className="w-full py-3 rounded-full bg-ev-surface-container-high text-primary font-bold text-xs uppercase tracking-widest">
          Current Plan
        </button>
      </div>
      {/* Pro Plan */}
      <div className="bg-primary text-primary-foreground rounded-xl p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-ev-tertiary-fixed" />
            <h3 className="text-xl font-bold">Pro Plan</h3>
          </div>
          <p className="text-primary-foreground/70 text-sm">Unlimited access to all features</p>
          <div className="text-4xl font-extrabold">
            $9.99<span className="text-base font-normal opacity-70">/mo</span>
          </div>
          <ul className="space-y-3">
            {["Unlimited AI courses", "Advanced AI tools", "Priority support", "Career advisor AI", "Skill analyzer"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <Zap className="h-4 w-4 text-ev-tertiary-fixed flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-full bg-ev-tertiary-fixed text-[#141f00] font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
          Billing & Plans
        </h2>
        <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
      </div>

      <div className="max-w-4xl">
        <PricingErrorBoundary fallback={fallbackPricing}>
          <div className="bg-ev-surface-container-lowest dark:bg-ev-surface-container rounded-xl p-8">
            <div className="overflow-hidden rounded-xl">
              <PricingTable />
            </div>
          </div>
        </PricingErrorBoundary>

        <div className="mt-8">
          <SubscriptionSync />
        </div>
      </div>
    </div>
  );
}

export default Billing;
