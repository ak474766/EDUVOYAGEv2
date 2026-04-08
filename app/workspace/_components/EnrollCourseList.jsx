"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import EnrollCourseCard from "./EnrollCourseCard";
import { ArrowRight } from "lucide-react";

function EnrollCourseList() {
  const [enrolledCourseList, setEnrollCourseList] = useState([]);
  useEffect(() => {
    GetEnrolledCourse();
  }, []);

  const GetEnrolledCourse = async () => {
    const result = await axios.get("/api/enroll-course");
    setEnrollCourseList(result.data);
  };

  return (
    enrolledCourseList?.length > 0 && (
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
              Continue Learning
            </h2>
            <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
          </div>
          <button className="flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-1 transition-transform">
            VIEW ALL COURSES{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {enrolledCourseList?.map((course, index) => (
            <EnrollCourseCard
              course={course?.courses}
              enrollCourse={course?.enrollCourse}
              key={index}
            />
          ))}
        </div>
      </section>
    )
  );
}

export default EnrollCourseList;
