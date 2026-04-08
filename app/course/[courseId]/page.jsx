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
      const courseResult = await axios.get("/api/courses?courseId=" + courseId);
      const enrollResult = await axios.get(
        "/api/enroll-course?courseId=" + courseId
      );
      const combinedData = {
        course: courseResult.data,
        enrollCourse:
          enrollResult.data?.[0]?.enrollCourse ||
          enrollResult.data?.[0]?.enrollCourseTable ||
          null,
        courses: courseResult.data,
      };
      setCourseInfo(combinedData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClickFromSidebar = (topicIndex) => {
    console.log("Topic clicked from sidebar in main page:", topicIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ev-surface dark:bg-[#191c1a]">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message="Loading your course content..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ev-surface font-sans text-ev-on-surface flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 left-0 right-0 w-full z-50">
        <CourseHeader courseInfo={courseInfo} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <SelectedChapterIndexContext.Provider
          value={{ selectedChapterIndex, setSelectedChapterIndex }}
        >
          <ChapterListSidebar
            courseInfo={courseInfo}
            onTopicClick={handleTopicClickFromSidebar}
            updateTrigger={updateTrigger}
          />
          <div className="flex-1 ml-0 md:ml-[360px] transition-all duration-300 ease-in-out p-6 md:p-10 w-full overflow-y-auto max-h-[calc(100vh-88px)]">
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
