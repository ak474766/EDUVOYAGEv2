"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Award, BookOpen, Zap } from "lucide-react";

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
    <section className="relative mt-8 rounded-xl overflow-hidden p-10 bg-gradient-to-br from-primary/10 via-ev-surface-container to-ev-secondary-container/20">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
        {/* Text content */}
        <div className="space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ev-surface-container-lowest text-primary text-[10px] font-bold tracking-[0.15em] uppercase">
            WELCOME BACK
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ev-on-surface">
            Welcome to EduVoyage,{" "}
            <span className="text-primary">
              {profile?.name || "Learner"}
            </span>
          </h1>
          <p className="text-ev-on-surface-variant max-w-lg leading-relaxed">
            Your journey through the digital grove continues. You have made
            significant progress this week. Keep the momentum alive.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          <div className="px-6 py-3 rounded-full bg-ev-surface-container-lowest flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
            <Award className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold tracking-tight text-ev-on-surface">
              {profile?.plan || "Free"} Member
            </span>
          </div>
          <div className="px-6 py-3 rounded-full bg-ev-surface-container-lowest flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-tight text-ev-on-surface">
              {courseCount} Courses Created
            </span>
          </div>
          {!isSubscribed && (
            <div className="px-6 py-3 rounded-full bg-primary text-primary-foreground flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
              <Zap className="h-5 w-5 text-ev-tertiary-fixed" />
              <span className="text-sm font-bold tracking-tight">
                {coursesLeft} Left
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative SVG */}
      <svg
        className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
        fill="none"
        viewBox="0 0 400 400"
      >
        <path
          d="M400 0C300 100 100 0 0 100S200 400 400 300"
          stroke="#4e6354"
          strokeWidth="2"
        />
      </svg>
    </section>
  );
}

export default WelcomeBanner;
