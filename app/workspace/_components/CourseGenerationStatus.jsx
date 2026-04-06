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
      <div className="p-4 bg-muted/30 rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  const isSubscribed = status.plan === "Premium";
  const isNearLimit =
    !isSubscribed && status.coursesLeft <= 2 && status.coursesLeft > 0;
  const isAtLimit = !isSubscribed && status.coursesLeft === 0;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isAtLimit
          ? "bg-red-50 border-red-200"
          : isNearLimit
          ? "bg-yellow-50 border-yellow-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Crown className="h-5 w-5 text-yellow-600" />
          ) : isNearLimit || isAtLimit ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-blue-600"></div>
          )}

          <div>
            <h3 className="font-semibold text-sm">
              {isSubscribed ? "Premium Plan" : "Free Plan"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isSubscribed
                ? "Unlimited course generation"
                : isAtLimit
                ? "Course limit reached"
                : `${status.coursesLeft} course${
                    status.coursesLeft === 1 ? "" : "s"
                  } remaining`}
            </p>
          </div>
        </div>

        {!isSubscribed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/workspace/billing")}
            className="text-xs"
          >
            {isAtLimit ? "Upgrade Now" : "Upgrade"}
          </Button>
        )}
      </div>

      {!isSubscribed && (
        <div className="mt-3">
          <div className="h-2 w-full bg-white/70 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                isAtLimit
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : isNearLimit
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                  : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              }`}
              style={{
                width: `${Math.max(
                  0,
                  (Number(status.coursesLeft) / 5) * 100
                )}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">
            {typeof status.coursesLeft === "number"
              ? `${status.coursesLeft} of 5 free courses remaining`
              : "Unlimited course generation"}
          </p>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          ⚠️ You're running low on free courses. Consider upgrading to Premium
          for unlimited access.
        </div>
      )}

      {isAtLimit && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
          🚫 You've reached the maximum limit of 5 courses. Upgrade to Premium
          to continue creating courses.
        </div>
      )}
    </div>
  );
}

export default CourseGenerationStatus;
