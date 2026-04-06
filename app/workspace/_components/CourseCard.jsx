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
  const [loading, setLoading] = useState(false); // Corrected spelling from 'loding' to 'loading'
  const router = useRouter();
  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/enroll-course", {
        courseId: course?.cid,
      });
      console.log(result.data);
      if (result.data?.message === "Course already enrolled") {
        toast.warning("Already enrolled!");
        setLoading(false);
        return;
      }
      toast.success("Enrolled!");
      // Ask parent to refresh its list
      if (typeof refreshData === "function") {
        try {
          await refreshData();
        } catch {}
      }
      // Force the workspace route to refresh and remount clients
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
    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={course?.bannerImageUrl}
          alt={course?.name}
          width={640}
          height={360}
          className="w-full aspect-video object-cover"
        />
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="font-semibold text-lg sm:text-xl leading-snug line-clamp-2 text-foreground">
          {courseJson?.name}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {courseJson?.description}
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Book className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">{courseJson?.noOfChapters}</span>
            <span className="text-muted-foreground">Chapters</span>
          </div>
          {course?.courseContent?.length ? (
            <Button
              size="sm"
              onClick={onEnrollCourse}
              disabled={loading}
              className="whitespace-nowrap"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <PlayCircle />
              )}
              <span className="ml-1.5">Enroll</span>
            </Button>
          ) : (
            <Link href={"/workspace/edit-course/" + course?.cid} className="shrink-0">
              <Button size="sm" variant="outline" className="whitespace-nowrap">
                <Settings className="mr-1" /> Generate
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
