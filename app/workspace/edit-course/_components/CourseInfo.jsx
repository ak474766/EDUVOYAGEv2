import React, { useState } from "react";
import {
  Book,
  Clock,
  Loader2Icon,
  PlayCircle,
  Settings,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../../../../components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ViewCourse from "../../view-course/[courseId]/page";
import Link from "next/link";

function CourseInfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const CalculateTotalDuration = () => {
    if (!courseLayout?.chapters || !Array.isArray(courseLayout.chapters))
      return "0 min";

    const totalMinutes = courseLayout.chapters.reduce((total, chapter) => {
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

  const GenerateCourseContent = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/generate-course-content", {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid,
      });
      console.log(result.data);
      setLoading(false);
      // Navigate with a cache-busting query and refresh so lists re-fetch
      const ts = Date.now();
      router.replace(`/workspace?ts=${ts}`);
      // Ensure refresh after navigation
      setTimeout(() => {
        try {
          router.refresh();
        } catch {}
      }, 50);
      toast.success("Course Generated successfully");
    } catch (e) {
      console.log(e);
      setLoading(false);
      toast.error("Server Side error, Try Again!");
    }
  };
  return (
    <div
      className="
    md:flex justify-between gap-6 p-6 rounded-2xl
    border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60
    shadow-lg transition-shadow hover:shadow-xl
  "
    >
      <div className="flex flex-col gap-4 md:gap-5 flex-1">
        <h2 className="font-bold text-3xl md:text-4xl tracking-tight">
          {courseLayout?.name}
        </h2>

        <p className="line-clamp-3 text-muted-foreground leading-relaxed">
          {courseLayout?.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <div
            className="
          flex items-center gap-4 p-4 rounded-xl border
          bg-card/60 backdrop-blur hover:bg-card/80
          ring-1 ring-border/50 shadow-sm hover:shadow-md
          transition-colors
        "
          >
            <Clock className="h-5 w-5 text-blue-500" />
            <section className="space-y-0.5">
              <h2 className="text-sm font-medium text-muted-foreground">
                Duration
              </h2>
              <h2 className="text-base font-semibold tracking-tight">
                {CalculateTotalDuration()}
              </h2>
            </section>
          </div>

          <div
            className="
          flex items-center gap-4 p-4 rounded-xl border
          bg-card/60 backdrop-blur hover:bg-card/80
          ring-1 ring-border/50 shadow-sm hover:shadow-md
          transition-colors
        "
          >
            <Book className="h-5 w-5 text-green-500" />
            <section className="space-y-0.5">
              <h2 className="text-sm font-medium text-muted-foreground">
                Chapters
              </h2>
              <h2 className="text-base font-semibold tracking-tight">
                {course?.noOfChapters}
              </h2>
            </section>
          </div>

          <div
            className="
          flex items-center gap-4 p-4 rounded-xl border
          bg-card/60 backdrop-blur hover:bg-card/80
          ring-1 ring-border/50 shadow-sm hover:shadow-md
          transition-colors
        "
          >
            <TrendingUp className="h-5 w-5 text-red-500" />
            <section className="space-y-0.5">
              <h2 className="text-sm font-medium text-muted-foreground">
                Difficulty Level
              </h2>
              <h2 className="text-base font-semibold tracking-tight capitalize">
                {course?.level}
              </h2>
            </section>
          </div>
        </div>

        {!viewCourse ? (
          <Button
            className="
          max-w-sm h-11 rounded-lg
          inline-flex items-center justify-center gap-2
          bg-gradient-to-r from-primary to-primary/85
          hover:from-primary/90 hover:to-primary/70
          text-primary-foreground
          shadow-md transition-all
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        "
            onClick={GenerateCourseContent}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                <span>Generate Content</span>
              </>
            )}
          </Button>
        ) : (
          <Link href={"/course/" + course?.cid}>
            <Button
              className="
            h-11 rounded-lg inline-flex items-center gap-2
            bg-emerald-600 hover:bg-emerald-600/90
            text-white shadow-md transition-all
            focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2
          "
            >
              <PlayCircle className="h-4 w-4" />
              <span>Continue Learning</span>
            </Button>
          </Link>
        )}
      </div>

      {course?.bannerImageUrl && (
        <Image
          src={course?.bannerImageUrl}
          alt={"banner Image"}
          width={400}
          height={400}
          className="
        w-full md:w-[420px] mt-5 md:mt-0
        object-cover h-[240px] rounded-2xl
        border ring-1 ring-black/5 shadow-md
      "
        />
      )}
    </div>
  );
}

export default CourseInfo;
