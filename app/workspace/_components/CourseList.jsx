"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import AddNewCourseDialog from "./AddNewCourseDialog";
import CourseCard from "./CourseCard";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { ArrowRight, Plus } from "lucide-react";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const { user } = useUser();
  useEffect(() => {
    user && GetCourseList();
  }, [user]);
  const GetCourseList = async () => {
    try {
      const result = await axios.get("/api/courses");
      const data = Array.isArray(result.data) ? result.data : [result.data];
      setCourseList(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourseList([]);
    }
  };
  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
            Your Courses
          </h2>
          <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
        </div>
        <div className="flex items-center gap-3">
          <AddNewCourseDialog>
            <Button className="h-10 bg-primary text-primary-foreground rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all px-5">
              <Plus className="h-4 w-4 mr-1" /> Create Course
            </Button>
          </AddNewCourseDialog>
        </div>
      </div>

      {courseList?.length == 0 ? (
        <div className="group flex flex-col items-center justify-center rounded-xl bg-ev-surface-container-lowest dark:bg-ev-surface-container p-8 text-center transition-all duration-300 hover:scale-[1.01]">
          <Image
            src={"/online-education.png"}
            alt="edu"
            width={80}
            height={80}
            className="opacity-90 drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
          />
          <h2 className="my-3 text-lg font-semibold text-ev-on-surface">
            You haven&apos;t created any courses yet
          </h2>
          <AddNewCourseDialog>
            <Button className="mt-2 bg-primary text-primary-foreground rounded-full hover:opacity-90">
              <Plus className="h-4 w-4 mr-1" /> Create your first course
            </Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courseList?.map((course, index) => (
            <CourseCard
              course={course}
              key={index}
              refreshData={GetCourseList}
            />
          ))}
        </div>
      )}
    </section>
  );
}
export default CourseList;
