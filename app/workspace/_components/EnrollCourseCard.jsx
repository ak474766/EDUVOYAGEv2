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
      if (minutes === 0) return `${hours}h`;
      return `${hours}h ${minutes}m`;
    }
    return `${totalMinutes} min`;
  };

  return (
    <div className="group relative bg-ev-surface-container-lowest dark:bg-ev-surface-container rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-500">
      {/* Image with overlays */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <Image
          src={course?.bannerImageUrl}
          alt={course?.name}
          width={500}
          height={375}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Level badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full glass-panel text-[10px] font-bold tracking-widest uppercase text-ev-on-surface-variant">
            {course?.level || "Beginner"}
          </span>
        </div>
        {/* Progress bar on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="w-full bg-white/20 backdrop-blur-md rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-ev-tertiary-fixed h-full glow-tertiary rounded-full transition-all duration-700"
              style={{ width: `${CalculatePerProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors text-ev-on-surface">
          {courseJson?.name}
        </h3>
        <div className="flex justify-between items-center text-xs text-ev-outline font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {CalculateTotalDuration()}
          </div>
          <div className="flex items-center gap-1.5">
            <Book className="h-3.5 w-3.5" />{" "}
            {course?.noOfChapters || courseJson?.chapters?.length || 0} chapters
          </div>
        </div>
        <Link href={"/workspace/view-course/" + course?.cid}>
          <button className="w-full py-3 rounded-full bg-ev-surface-container-high dark:bg-ev-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-2">
            Resume Lesson
          </button>
        </Link>
      </div>
    </div>
  );
}

export default EnrollCourseCard;
