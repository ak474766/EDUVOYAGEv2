"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { Crown, AlertTriangle } from "lucide-react";

function CourseGenerationStatus() {
  const [status, setStatus] = useState({
    plan: "Free",
    coursesLeft: 5,
    totalCourses: 0,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [userRes, coursesRes] = await Promise.all([
          axios.get("/api/user"),
          axios.get("/api/courses"),
        ]);
        const userData = userRes.data;
        const courses = coursesRes.data || [];
        const totalCourses = courses.length;
        const isSubscribed = userData.plan === "Premium";
        setStatus({
          plan: userData.plan || "Free",
          coursesLeft: isSubscribed
            ? "unlimited"
            : Math.max(0, 5 - totalCourses),
          totalCourses,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching status:", error);
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchStatus();
  }, []);

  if (status.loading) {
    return (
      <div className="p-6 bg-ev-surface-container-low rounded-lg animate-pulse">
        <div className="h-4 bg-ev-surface-container-high rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-ev-surface-container-high rounded w-1/2"></div>
      </div>
    );
  }

  const isSubscribed = status.plan === "Premium";
  const isNearLimit =
    !isSubscribed && status.coursesLeft <= 2 && status.coursesLeft > 0;
  const isAtLimit = !isSubscribed && status.coursesLeft === 0;

  return (
    <section className="bg-ev-surface-container-low dark:bg-ev-surface-container rounded-lg p-6 flex items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isAtLimit
              ? "bg-ev-error-container text-destructive"
              : isSubscribed
              ? "bg-ev-secondary-container text-primary"
              : "bg-ev-surface-container-high text-primary"
          }`}
        >
          {isSubscribed ? (
            <Crown className="h-5 w-5" />
          ) : isAtLimit ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="font-bold tracking-tight text-ev-on-surface">
            {isSubscribed
              ? "Premium Plan — Unlimited"
              : isAtLimit
              ? "Course Limit Reached"
              : `${status.coursesLeft} Course${
                  status.coursesLeft === 1 ? "" : "s"
                } Remaining`}
          </h3>
          <p className="text-sm text-ev-on-surface-variant">
            {isSubscribed
              ? "Unlimited course generation active."
              : isAtLimit
              ? "You've reached the maximum number of courses for the Free tier. Upgrade to Pro for unlimited learning."
              : `You have ${status.coursesLeft} of 5 free courses remaining.`}
          </p>
        </div>
      </div>

      {!isSubscribed && (
        <button
          onClick={() => router.push("/workspace/billing")}
          className="px-6 py-3 bg-ev-surface-container-highest hover:bg-ev-surface-container-high transition-colors rounded-full text-sm font-bold tracking-tight text-ev-on-surface whitespace-nowrap"
        >
          {isAtLimit ? "Review Plans" : "Upgrade"}
        </button>
      )}
    </section>
  );
}

export default CourseGenerationStatus;
