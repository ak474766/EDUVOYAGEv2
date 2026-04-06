"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import EnrollCourseCard from "./EnrollCourseCard";

function EnrollCourseList() {
  const [enrolledCourseList, setEnrollCourseList] = useState([]);
  useEffect(() => {
    GetEnrolledCourse();
  }, []);

  const GetEnrolledCourse = async () => {
    const result = await axios.get("/api/enroll-course");

    console.log(result.data);
    setEnrollCourseList(result.data);
  };
  return (
    enrolledCourseList?.length > 0 && (
      <div className="mt-3">
        <div className="mt-16 mb-8">
          <h2 className="font-bold text-3xl bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Continue Learning your course
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-full mt-3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrolledCourseList?.map((course, index) => (
            <EnrollCourseCard
              course={course?.courses}
              enrollCourse={course?.enrollCourse}
              key={index}
            />
          ))}
        </div>
      </div>
    )
  );
}

export default EnrollCourseList;
