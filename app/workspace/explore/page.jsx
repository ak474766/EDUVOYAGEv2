"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../../../@/components/ui/input";
import { Button } from "../../../@/components/ui/button";
import { Search } from "lucide-react";
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
    console.log(result.data);
    if (Array.isArray(result.data)) {
      setCourseList(result.data);
      setAllCourses(result.data);
    } else {
      console.error("API response is not an array:", result.data);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-bold text-4xl mb-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
          Explore Courses
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mb-8">
          <div className="relative flex-1">
            <Input
              placeholder="Search for courses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="pl-4 pr-12 py-3 border-2 border-slate-200 dark:border-white/10 rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-sm focus:border-blue-400 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <Search size={20} />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-medium"
          >
            <Search size={18} />
            Search
          </Button>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 mb-10 group">
          <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-50'></div>

          <div className="md:w-1/2 p-10 z-10 relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              🎓 Explore More courses
            </h2>
            <p className="mt-4 text-lg text-white/90 leading-relaxed font-medium">
              Accelerate your learning! 🚀 Discover endless knowledge — from
              Python programming and data science to web development and machine
              learning fundamentals. Let AI transform your learning goals into
              reality effortlessly.
            </p>
            <button className="justify-center whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 bg-white/10 backdrop-blur-md shadow-lg h-12 px-6 py-3 mt-6 border-pink-400/50 text-white hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:border-pink-300 transition-all duration-300 flex items-center gap-3 group-hover:transform group-hover:scale-105">
              🔍 Browse Templates
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <div className="md:w-1/2 relative h-[280px] md:h-[320px] w-full overflow-hidden">
            <video
              src="/explore-courses-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
            ></video>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/60"></div>
          </div>
        </div>

        <div className="mt-16 mb-8">
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Explore Videos Created By Other Users
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full mt-3"></div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {courseList.length > 0
            ? courseList?.map((course, index) => (
                <div
                  key={index}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <CourseCard course={course} refreshData={GetCourseList} />
                </div>
              ))
            : [0, 1, 2, 3].map((item, index) => (
                <Skeleton
                  key={index}
                  className="w-full h-[260px] rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 animate-pulse shadow-lg"
                />
              ))}
        </div>
      </div>
    </div>
  );
}

export default Explore;
