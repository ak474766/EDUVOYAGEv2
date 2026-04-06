"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import AddNewCourseDialog from "./AddNewCourseDialog";
import CourseCard from "./CourseCard";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const { user } = useUser();
  useEffect(() => {
    user && GetCourseList();
  }, [user]);
  const GetCourseList = async () => {
    try {
      const result = await axios.get("/api/courses");
      console.log(result.data);
      // Ensure we always set an array, even if the API returns a single object
      const data = Array.isArray(result.data) ? result.data : [result.data];
      setCourseList(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseList([]);
    }
  };
  return (
    <div className="mt-10">
      <div className="mt-16 mb-8 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Course List
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full mt-3"></div>
        </div>
        <AddNewCourseDialog>
          <Button className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm">
            + Create Course
          </Button>
        </AddNewCourseDialog>
      </div>
      {courseList?.length == 0 ? (
        <div className="group mt-4 flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <Image
            src={"/online-education.png"}
            alt="edu"
            width={80}
            height={80}
            className="opacity-90 drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
          />
          <h2 className="my-3 text-lg sm:text-xl font-semibold text-foreground">
            Look like you havn't created any courses yet
          </h2>
          <AddNewCourseDialog>
            <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-shadow hover:shadow-md">
              + Create your first course
            </Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {courseList?.map((course, index) => (
              <CourseCard
                course={course}
                key={index}
                refreshData={GetCourseList}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default CourseList;
