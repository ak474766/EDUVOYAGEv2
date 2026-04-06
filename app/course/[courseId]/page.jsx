"use client";
import React, { useEffect, useState } from "react";
import { SelectedChapterIndexContext } from "../../../context/SelectedChapterIndexContext";
import CourseHeader from "../../workspace/_components/CourseHeader";
import ChapterListSidebar from "../_components/ChapterListSidebar";
import ChapterContent from "../_components/ChapterContent";
import { useParams } from "next/navigation";
import axios from "axios";
import LoadingSpinner from "../../../components/ui/loading";

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    GetEnrolledCourseById();
  }, []);

  const GetEnrolledCourseById = async () => {
    try {
      setLoading(true);
      // Get course data from the courses API
      const courseResult = await axios.get("/api/courses?courseId=" + courseId);
      console.log("Course data:", courseResult.data);

      // Get enrollment data from enroll-course API
      const enrollResult = await axios.get(
        "/api/enroll-course?courseId=" + courseId
      );
      console.log("Enrollment data:", enrollResult.data);

      // Combine the data in the expected structure
      const combinedData = {
        course: courseResult.data,
        // From innerJoin result, pick only the enrollCourse part
        enrollCourse:
          enrollResult.data?.[0]?.enrollCourse ||
          enrollResult.data?.[0]?.enrollCourseTable ||
          null,
        courses: courseResult.data, // This contains the courseContent
      };

      console.log("Combined data:", combinedData);
      setCourseInfo(combinedData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle topic expansion from sidebar
  const handleTopicClickFromSidebar = (topicIndex) => {
    console.log("Topic clicked from sidebar in main page:", topicIndex);
    // This will be passed to ChapterContent to expand the specific topic and scroll to it
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message="Loading your course content..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Header with enhanced styling */}
      <div className="fixed top-0 left-0 right-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 z-50 shadow-sm">
        <CourseHeader courseInfo={courseInfo} />
      </div>

      {/* Main Content Area with improved spacing and layout */}
      <div className="flex gap-0 pt-20 pb-8 min-h-screen">
        <SelectedChapterIndexContext.Provider
          value={{ selectedChapterIndex, setSelectedChapterIndex }}
        >
          <ChapterListSidebar
            courseInfo={courseInfo}
            onTopicClick={handleTopicClickFromSidebar}
            updateTrigger={updateTrigger}
          />
          <div className="flex-1 ml-80 transition-all duration-300 ease-in-out">
            <ChapterContent
              courseInfo={courseInfo}
              refreshData={() => GetEnrolledCourseById()}
              onTopicClickFromSidebar={handleTopicClickFromSidebar}
              onUpdateTrigger={setUpdateTrigger}
            />
          </div>
        </SelectedChapterIndexContext.Provider>
      </div>
    </div>
  );
}

export default Course;
