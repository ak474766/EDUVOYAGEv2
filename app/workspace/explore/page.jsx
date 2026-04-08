"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../../../@/components/ui/input";
import { Button } from "../../../@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import CourseCard from "../_components/CourseCard";
import { Skeleton } from "../../../@/components/ui/skeleton";

function Explore() {
  const [courseList, setCourseList] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  useEffect(() => {
    user && GetCourseList();
  }, [user]);
  const GetCourseList = async () => {
    const result = await axios.get("/api/courses?courseId=0");
    if (Array.isArray(result.data)) {
      setCourseList(result.data);
      setAllCourses(result.data);
    } else {
      setCourseList([]);
      setAllCourses([]);
    }
  };
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setCourseList(allCourses);
      return;
    }
    const filtered = allCourses.filter((course) => {
      const fieldsToSearch = [
        course?.title,
        course?.name,
        course?.description,
        course?.category,
        course?.level,
      ];
      return fieldsToSearch.some(
        (field) =>
          typeof field === "string" && field.toLowerCase().includes(query)
      );
    });
    setCourseList(filtered);
  };

  return (
    <div className="space-y-12">
      {/* Page heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
          Explore Courses
        </h2>
        <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ev-outline" />
          <input
            placeholder="SEARCH FOR COURSES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="w-full pl-12 pr-6 py-3 bg-ev-surface-container-high dark:bg-ev-surface-container border-none rounded-full text-xs font-medium tracking-widest uppercase placeholder:text-ev-outline focus:ring-2 focus:ring-primary/20 transition-all outline-none text-ev-on-surface"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
        >
          Search
        </button>
      </div>

      {/* Hero banner */}
      <section className="relative rounded-xl overflow-hidden p-10 bg-gradient-to-br from-primary via-primary/80 to-ev-tertiary text-primary-foreground">
        <div className="relative z-10 max-w-xl space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight">
            Discover Endless Knowledge
          </h2>
          <p className="text-primary-foreground/80 leading-relaxed">
            Accelerate your learning! Discover courses from Python and data
            science to web development and machine learning. Let AI transform
            your learning goals into reality.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-ev-tertiary-fixed text-[#141f00] font-bold text-sm hover:scale-105 transition-transform">
            Browse Templates <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {/* Decorative */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </section>

      {/* Section header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
          Community Courses
        </h2>
        <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courseList.length > 0
          ? courseList?.map((course, index) => (
              <CourseCard course={course} key={index} refreshData={GetCourseList} />
            ))
          : [0, 1, 2].map((item, index) => (
              <Skeleton
                key={index}
                className="w-full h-[260px] rounded-xl bg-ev-surface-container-high animate-pulse"
              />
            ))}
      </div>
    </div>
  );
}

export default Explore;
