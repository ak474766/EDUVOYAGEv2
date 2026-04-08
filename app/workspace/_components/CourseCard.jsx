import { Book, LoaderCircle, PlayCircle, Settings } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function CourseCard({ course, refreshData }) {
  const courseJson = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/enroll-course", {
        courseId: course?.cid,
      });
      if (result.data?.message === "Course already enrolled") {
        toast.warning("Already enrolled!");
        setLoading(false);
        return;
      }
      toast.success("Enrolled!");
      if (typeof refreshData === "function") {
        try {
          await refreshData();
        } catch {}
      }
      const ts = Date.now();
      router.replace(`/workspace?ts=${ts}`);
      setTimeout(() => {
        try {
          router.refresh();
        } catch {}
      }, 50);
      setLoading(false);
    } catch (e) {
      toast.error("Server side error");
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-ev-surface-container-lowest dark:bg-ev-surface-container rounded-xl overflow-hidden hover:scale-[1.02] transition-all duration-500">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <Image
          src={course?.bannerImageUrl}
          alt={course?.name}
          width={640}
          height={480}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full glass-panel text-[10px] font-bold tracking-widest uppercase text-ev-on-surface-variant">
            {course?.level || "Beginner"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors text-ev-on-surface">
          {courseJson?.name}
        </h3>
        <p className="text-sm text-ev-on-surface-variant leading-relaxed line-clamp-2">
          {courseJson?.description}
        </p>
        <div className="flex justify-between items-center text-xs text-ev-outline font-medium">
          <div className="flex items-center gap-1.5">
            <Book className="h-3.5 w-3.5" />
            {courseJson?.noOfChapters} Chapters
          </div>
        </div>
        {course?.courseContent?.length ? (
          <button
            onClick={onEnrollCourse}
            disabled={loading}
            className="w-full py-3 rounded-full bg-ev-surface-container-high dark:bg-ev-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="animate-spin h-4 w-4 mx-auto" />
            ) : (
              "Enroll Now"
            )}
          </button>
        ) : (
          <Link href={"/workspace/edit-course/" + course?.cid}>
            <button className="w-full py-3 rounded-full bg-ev-surface-container-high dark:bg-ev-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Generate Course
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
