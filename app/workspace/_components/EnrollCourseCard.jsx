import { Button } from "../../../@/components/ui/button";
import Image from "next/image";
import React from "react";
import { Progress } from "../../../@/components/ui/progress";
import { PlayCircle, Clock, Book, TrendingUp } from "lucide-react";
import Link from "next/link";

function EnrollCourseCard({ course, enrollCourse }) {
  const courseJson = course?.courseJson?.course;

  const CalculatePerProgress = () => {
    const completedCount = Array.isArray(enrollCourse?.completedChapters)
      ? enrollCourse.completedChapters.length
      : 0;
    const totalCount = Array.isArray(course?.courseContent)
      ? course.courseContent.length
      : 0;

    if (!totalCount) return 0;

    const percent = (completedCount / totalCount) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  };

  const CalculateTotalDuration = () => {
    if (!courseJson?.chapters || !Array.isArray(courseJson.chapters))
      return "0 min";

    const totalMinutes = courseJson.chapters.reduce((total, chapter) => {
      const duration = chapter?.duration;
      if (duration && typeof duration === "string") {
        // Extract minutes from duration string (e.g., "30 min", "1 hour", "1.5 hours")
        const match = duration.match(/(\d+(?:\.\d+)?)\s*(min|hour|hours)/i);
        if (match) {
          const value = parseFloat(match[1]);
          const unit = match[2].toLowerCase();
          if (unit === "min") return total + value;
          if (unit === "hour" || unit === "hours") return total + value * 60;
        }
      }
      return total;
    }, 0);

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (minutes === 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      return `${hours}h ${minutes}m`;
    }
    return `${totalMinutes} min`;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Image
        src={course?.bannerImageUrl}
        alt={course?.name}
        width={500}
        height={300}
        className="w-full aspect-video rounded-t-2xl object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Level badge overlay */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-neutral-900/60 text-white backdrop-blur dark:bg-white/15 dark:text-neutral-100">
          {course?.level || "Beginner"}
        </span>
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-lg sm:text-xl tracking-tight text-foreground">
          {courseJson?.name}
        </h2>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {courseJson?.description}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="truncate">{CalculateTotalDuration()}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Book className="h-3.5 w-3.5" />
            <span className="truncate">
              {course?.noOfChapters || courseJson?.chapters?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="truncate capitalize">
              {course?.level || "Beginner"}
            </span>
          </div>
        </div>

        <div className=" ">
          <h2 className="flex items-center justify-between text-[11px] sm:text-xs font-medium uppercase text-muted-foreground">
            Progress
            <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-neutral-900/5 text-foreground dark:bg-white/10 dark:text-white">
              {CalculatePerProgress()}%
            </span>
          </h2>
          <Progress className="mt-2 h-2" value={CalculatePerProgress()} />

          <Link href={"/workspace/view-course/" + course?.cid}>
            <Button className="w-full mt-3 gap-2 shadow-sm hover:shadow">
              <PlayCircle className="h-4 w-4" />
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnrollCourseCard;
