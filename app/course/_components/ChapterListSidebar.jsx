import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../@/components/ui/accordion";
import { SelectedChapterIndexContext } from "../../../context/SelectedChapterIndexContext";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

function ChapterListSidebar({ courseInfo, onTopicClick, updateTrigger }) {
  const course = courseInfo?.course;
  const enrollCourse = courseInfo?.enrollCourse;
  // Fix: courseContent is directly on the course object, not nested under courses
  const courseContent =
    course?.courseContent || courseInfo?.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(
    SelectedChapterIndexContext
  );

  // Local state for completion status to ensure re-renders
  const [completedChapters, setCompletedChapters] = useState(
    enrollCourse?.completedChapters ?? []
  );

  // Toggle state for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Update local state when courseInfo changes
  useEffect(() => {
    console.log("Sidebar: courseInfo changed, enrollCourse:", enrollCourse);
    const newCompletedChapters = enrollCourse?.completedChapters ?? [];
    console.log(
      "Sidebar: Setting completed chapters to:",
      newCompletedChapters
    );
    setCompletedChapters(newCompletedChapters);
  }, [enrollCourse?.completedChapters, courseInfo, updateTrigger]);

  // Force re-render when courseInfo changes
  useEffect(() => {
    console.log("Sidebar: Full courseInfo changed:", courseInfo);
  }, [courseInfo]);

  const handleTopicClick = (chapterIndex, topicIndex) => {
    console.log("Topic clicked in sidebar:", chapterIndex, topicIndex);

    // Check if we're changing chapters
    const isChangingChapter = selectedChapterIndex !== chapterIndex;

    if (isChangingChapter) {
      // If changing chapters, store the topic index to scroll to after chapter change
      window.pendingTopicScroll = topicIndex;
      console.log(
        "Changing chapter, storing pending scroll for topic:",
        topicIndex
      );
    }

    setSelectedChapterIndex(chapterIndex);

    // Call the parent function to expand the specific topic
    if (onTopicClick) {
      onTopicClick(topicIndex);
    }

    // If not changing chapters, scroll immediately
    if (!isChangingChapter) {
      // Also try to call the global function for direct communication
      if (window.handleSidebarTopicClick) {
        window.handleSidebarTopicClick(topicIndex);
      }

      // Add a small delay to ensure the chapter change is processed first
      setTimeout(() => {
        if (window.handleSidebarTopicClick) {
          window.handleSidebarTopicClick(topicIndex);
        }
      }, 100);
    }
  };

  const isTopicCompleted = (chapterIndex, topicIndex) => {
    const completed = completedChapters.includes(chapterIndex);
    console.log(`Topic ${chapterIndex}-${topicIndex} completed:`, completed);
    return completed;
  };

  const isChapterCompleted = (chapterIndex) => {
    const completed = completedChapters.includes(chapterIndex);
    console.log(`Chapter ${chapterIndex} completed:`, completed);
    return completed;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const courseId = course?.cid || courseInfo?.courses?.cid;
  const [quizGenerated, setQuizGenerated] = useState(
    Boolean(course?.quizJSON?.quizzes?.length)
  );

  useEffect(() => {
    setQuizGenerated(Boolean(course?.quizJSON?.quizzes?.length));
  }, [course?.quizJSON]);

  const handleGenerateQuiz = async () => {
    if (!courseId) {
      toast.error("Missing course id");
      return;
    }
    if (quizGenerated) {
      toast.info("Quiz already generated for this course");
      return;
    }
    try {
      window.dispatchEvent(
        new CustomEvent("quiz-generation", { detail: { loading: true } })
      );
      const { data } = await axios.post("/api/generate-quiz", { courseId });
      if (data?.quizJSON?.quizzes?.length) {
        // Update local courseInfo object so UI knows it's generated
        if (courseInfo?.course) {
          courseInfo.course.quizJSON = data.quizJSON;
        }
        setQuizGenerated(true);
        toast.success("Quiz generated successfully");
        window.dispatchEvent(
          new CustomEvent("quiz-generation", {
            detail: { loading: false, created: true },
          })
        );
      } else {
        toast.error(data?.message || data?.error || "Failed to generate quiz");
        window.dispatchEvent(
          new CustomEvent("quiz-generation", {
            detail: { loading: false, created: false },
          })
        );
      }
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Quiz generation failed";
      toast.error(msg);
      window.dispatchEvent(
        new CustomEvent("quiz-generation", {
          detail: { loading: false, created: false },
        })
      );
    }
  };

  console.log("Sidebar render - completedChapters:", completedChapters);

  return (
    <>
      {/* Enhanced Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`mt-[88px]
          fixed top-6 z-50 p-3 rounded-full 
          bg-ev-surface-container-highest
          shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-300 ease-in-out
          text-ev-on-surface
          ${isSidebarOpen ? "left-[370px]" : "left-6"}
        `}
        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {/* Enhanced Sidebar */}
      <div
        className={`mt-[88px]
          fixed top-0 left-0 h-[calc(100vh-88px)]
          bg-ev-surface-container-low
          shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-40
          ${
            isSidebarOpen
              ? "w-[360px] translate-x-0"
              : "w-[360px] -translate-x-full"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-ev-surface-container-low z-10 p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-ev-primary" />
            <h2 className="font-bold text-xl tracking-tight text-ev-on-surface">
              Course Chapters
            </h2>
          </div>
          <p className="text-sm text-ev-on-surface-variant font-medium">
            {courseContent?.length} chapters available
          </p>
          <div className="mt-4">
            {!quizGenerated ? (
              <button
                onClick={handleGenerateQuiz}
                className={`w-full px-4 py-3 rounded-full text-base font-bold transition-all bg-ev-primary text-ev-surface hover:bg-ev-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-95`}
                title="Generate 10-question quiz"
              >
                Generate Quiz
              </button>
            ) : (
              <div className="bg-ev-surface-container rounded-2xl p-4">
                <div className="text-sm font-bold text-ev-on-surface-variant mb-3">
                  Jump to question
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const results = enrollCourse?.userQuizResults;
                    const state = Array.isArray(results)
                      ? results[i]
                      : undefined; // true, false, or undefined
                    const colorClasses =
                      state === true
                        ? "bg-ev-secondary-container text-ev-on-surface"
                        : state === false
                        ? "bg-ev-error-container text-ev-on-surface font-bold"
                        : "bg-ev-surface-container-highest text-ev-on-surface hover:bg-ev-outline-variant/30";
                    const title =
                      state === true
                        ? `Question ${i + 1}: Correct`
                        : state === false
                        ? `Question ${i + 1}: Incorrect`
                        : `Go to question ${i + 1}`;
                    return (
                      <button
                        key={i}
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent("quiz-jump", {
                              detail: { index: i },
                            })
                          )
                        }
                        className={`py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 ${colorClasses}`}
                        title={title}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chapters List */}
        <div className="p-6 pt-0">
          <Accordion type="single" collapsible className="space-y-4">
            {courseContent?.map((chapter, index) => {
              const chapterCompleted = isChapterCompleted(index);
              const isSelected = selectedChapterIndex === index;

              return (
                <AccordionItem
                  value={chapter?.CourseData?.chapterName}
                  key={index}
                  onClick={() => setSelectedChapterIndex(index)}
                  className={`
                    w-full rounded-3xl border-0 transition-all duration-300 overflow-hidden box-border
                    bg-ev-surface-container 
                    ${
                      chapterCompleted
                        ? "bg-ev-secondary-container text-ev-on-surface"
                        : isSelected
                        ? "bg-ev-surface-container-highest shadow-sm scale-[1.02]"
                        : "hover:bg-ev-surface-container-highest hover:scale-[1.01]"
                    }
                  `}
                >
                  <AccordionTrigger
                    className={`
                      w-full text-base font-bold px-5 py-5 rounded-3xl
                      transition-all duration-300 focus-visible:outline-none
                      justify-between hover:no-underline
                      [&>svg]:transition-transform [&>svg]:duration-300
                      data-[state=open]:[&>svg]:rotate-180
                      text-ev-on-surface
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {chapterCompleted ? (
                        <CheckCircle className="h-6 w-6 text-ev-primary flex-shrink-0" />
                      ) : (
                        <PlayCircle className="h-6 w-6 text-ev-outline-variant flex-shrink-0" />
                      )}
                      <span className="truncate font-bold leading-tight text-left">
                        {index + 1}. {chapter?.CourseData?.chapterName}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent asChild>
                    <div className="px-2 pb-4">
                      {chapter?.CourseData?.topics.map((topic, topicIndex) => {
                        const topicCompleted = isTopicCompleted(
                          index,
                          topicIndex
                        );

                        return (
                          <div
                            key={topicIndex}
                            onClick={() => handleTopicClick(index, topicIndex)}
                            className={`
                              px-4 py-3 my-1 rounded-2xl text-sm cursor-pointer
                              transition-all duration-300
                              relative pl-8 hover:scale-[1.02]
                              before:absolute before:left-4 before:top-1/2 before:-translate-y-1/2
                              before:h-1.5 before:w-1.5 before:rounded-full
                              ${
                                topicCompleted
                                  ? "bg-ev-surface-container-highest text-ev-on-surface font-semibold before:bg-ev-primary shadow-sm"
                                  : "text-ev-on-surface-variant hover:bg-ev-surface hover:text-ev-on-surface before:bg-ev-outline-variant"
                              }
                            `}
                            title={topic?.topic}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="truncate break-words">
                                {topic?.topic}
                              </span>
                              {topicCompleted && (
                                <CheckCircle className="h-4 w-4 text-ev-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </>
  );
}

export default ChapterListSidebar;
