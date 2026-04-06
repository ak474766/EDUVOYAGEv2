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
        className={`mt-20
          fixed top-6 z-50 p-3 rounded-full 
          bg-white/90 dark:bg-slate-800/90 backdrop-blur-md
          border border-slate-200/60 dark:border-slate-600/60 
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          hover:bg-white dark:hover:bg-slate-800
          ${isSidebarOpen ? "left-[370px]" : "left-6"}
        `}
        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      {/* Enhanced Sidebar */}
      <div
        className={`mt-20
          fixed top-0 left-0 h-screen
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
          border-r border-slate-200/60 dark:border-slate-700/60
          shadow-xl
          overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-40
          ${
            isSidebarOpen
              ? "w-[360px] translate-x-0"
              : "w-[360px] -translate-x-full"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">
              Course Chapters
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {courseContent?.length} chapters available
          </p>
          <div className="mt-3">
            {!quizGenerated ? (
              <button
                onClick={handleGenerateQuiz}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700`}
                title="Generate 10-question quiz"
              >
                Generate Quiz
              </button>
            ) : (
              <div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
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
                        ? "border-emerald-400 bg-emerald-50/70 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : state === false
                        ? "border-rose-400 bg-rose-50/70 text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                        : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700";
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
                        className={`py-2 rounded-lg border text-sm font-semibold transition-colors ${colorClasses}`}
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
        <div className="p-6 pt-4">
          <Accordion type="single" collapsible className="space-y-3">
            {courseContent?.map((chapter, index) => {
              const chapterCompleted = isChapterCompleted(index);
              const isSelected = selectedChapterIndex === index;

              return (
                <AccordionItem
                  value={chapter?.CourseData?.chapterName}
                  key={index}
                  onClick={() => setSelectedChapterIndex(index)}
                  className={`
                    w-full rounded-xl border transition-all duration-200 overflow-hidden box-border
                    ${
                      chapterCompleted
                        ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-700/60"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-600/60"
                    }
                    ${
                      isSelected
                        ? "ring-2 ring-blue-500/50 dark:ring-blue-400/50 shadow-md"
                        : "hover:shadow-md"
                    }
                    data-[state=open]:bg-white dark:data-[state=open]:bg-slate-800
                  `}
                >
                  <AccordionTrigger
                    className={`
                      w-full text-base font-medium px-4 py-4 rounded-xl
                      transition-all duration-200 focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      justify-between hover:no-underline
                      [&>svg]:transition-transform [&>svg]:duration-200
                      data-[state=open]:[&>svg]:rotate-180
                      ${
                        chapterCompleted
                          ? "bg-emerald-100/80 dark:bg-emerald-800/30 text-emerald-800 dark:text-emerald-200 border-emerald-300/60 dark:border-emerald-600/60 hover:bg-emerald-200/80 dark:hover:bg-emerald-700/40"
                          : "hover:bg-slate-100/80 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {chapterCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {index + 1}. {chapter?.CourseData?.chapterName}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent asChild>
                    <div className="px-3 pb-3">
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
                              p-3 my-2 rounded-lg text-sm cursor-pointer
                              border transition-all duration-200
                              relative pl-4 hover:scale-[1.02] hover:shadow-sm
                              before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2
                              before:h-2 before:w-2 before:rounded-full
                              ${
                                topicCompleted
                                  ? "bg-emerald-100/80 dark:bg-emerald-800/30 text-emerald-800 dark:text-emerald-200 border-emerald-300/60 dark:border-emerald-600/60 before:bg-emerald-600 dark:before:bg-emerald-400 shadow-sm"
                                  : "bg-white/80 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-600/40 border-slate-200/60 dark:border-slate-600/60 before:bg-slate-400 dark:before:bg-slate-500"
                              }
                            `}
                            title={topic?.topic}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <span className="truncate break-words font-medium">
                                {topic?.topic}
                              </span>
                              {topicCompleted && (
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
