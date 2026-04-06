"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

function WelcomeBanner() {
  const [profile, setProfile] = useState({ name: "", plan: "" });
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const [userRes, coursesRes] = await Promise.all([
          axios.get("/api/user"),
          axios.get("/api/courses"),
        ]);

        if (!ignore) {
          setProfile(userRes.data ?? { name: "", plan: "" });
          setCourseCount(coursesRes.data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  const isSubscribed = profile?.plan === "Premium";
  const coursesLeft = isSubscribed ? "unlimited" : Math.max(0, 5 - courseCount);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Gradient background layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-500"
      />

      {/* Frosted overlay card */}
      <div className="relative p-5 md:p-7 bg-white/10 backdrop-blur-md ring-1 ring-white/20 shadow-xl">
        <h2 className="font-bold text-2xl text-white flex items-center gap-2">
          <span className="motion-safe:animate-pulse">👋</span>
          <span>
            Welcome to EduVoyage{profile?.name ? ", " : ""}
            {profile?.name && (
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                {" "}
                {profile.name}
              </span>
            )}
          </span>
        </h2>

        <p className="text-white/90 mt-1">
          Learn, create, and explore your favorite courses with EduVoyage.
        </p>

        {/* Live region: status badges */}
        <div
          className="pt-3 flex flex-wrap items-center gap-2 sm:gap-3"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {profile?.plan && (
            <span className="text-[12px] md:text-sm px-3 py-1.5 rounded-lg font-semibold tracking-wide bg-white/15 text-white ring-1 ring-white/30 shadow-sm hover:scale-[1.02] transition-transform motion-safe:duration-200">
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">⭐</span> {profile.plan} Member
              </span>
            </span>
          )}

          <span className="text-[12px] md:text-sm px-3 py-1.5 rounded-lg font-semibold tracking-wide bg-white/15 text-white ring-1 ring-white/30 shadow-sm hover:scale-[1.02] transition-transform motion-safe:duration-200">
            <span className="inline-flex items-center gap-1">
              📚 {courseCount} Course{courseCount !== 1 ? "s" : ""} Created
            </span>
          </span>

          {!isSubscribed && (
            <span className="text-[12px] md:text-sm px-3 py-1.5 rounded-lg font-semibold tracking-wide bg-white/15 text-white ring-1 ring-white/30 shadow-sm hover:scale-[1.02] transition-transform motion-safe:duration-200">
              <span className="inline-flex items-center gap-1">
                🎯 {coursesLeft} Left
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
