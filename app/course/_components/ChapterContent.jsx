import React, { useContext, useState, useEffect, useRef } from "react"; // Import useRef
import { SelectedChapterIndexContext } from "../../../context/SelectedChapterIndexContext";
import YouTube from "react-youtube";
import { Button } from "../../../components/ui/button";
import {
  CheckCircle,
  Cross,
  Loader2Icon,
  X,
  Play,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useParams } from "next/navigation";

function ChapterContent({
  courseInfo,
  refreshData,
  onTopicClickFromSidebar,
  onUpdateTrigger,
}) {
  // place near other hooks
  const [openTopics, setOpenTopics] = React.useState({});

  // Add refs for each topic
  const topicRefs = useRef({});

  const { courseId } = useParams();
  const { course, enrollCourse } = courseInfo ?? "";
  // Fix: courseContent is directly on the course object, not nested under courses
  const courseContent =
    course?.courseContent || courseInfo?.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(
    SelectedChapterIndexContext
  );
  const videoData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.CourseData?.topics;

  const [localCompletedChapter, setLocalCompletedChapter] = useState(
    (enrollCourse?.completedChapters ?? []).map((c) => Number(c))
  );

  useEffect(() => {
    setLocalCompletedChapter(
      (enrollCourse?.completedChapters ?? []).map((c) => Number(c))
    );
  }, [enrollCourse?.completedChapters]);

  // Function to scroll to a specific topic
  const scrollToTopic = (topicIndex) => {
    console.log("Attempting to scroll to topic:", topicIndex);
    const topicElement = topicRefs.current[topicIndex];
    if (topicElement) {
      console.log("Topic element found, expanding and scrolling...");
      // Expand the topic first
      setOpenTopics((prev) => ({ ...prev, [topicIndex]: true }));

      // Wait a bit for the expansion animation to start, then scroll
      setTimeout(() => {
        topicElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });

        // Add a subtle highlight effect
        topicElement.style.transition = "box-shadow 0.3s ease";
        topicElement.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
        setTimeout(() => {
          topicElement.style.boxShadow = "";
        }, 2000);
      }, 100);
    } else {
      console.log("Topic element not found for index:", topicIndex);
    }
  };

  // Function to handle topic expansion from sidebar
  const handleTopicClickFromSidebar = (topicIndex) => {
    console.log("Expanding topic from sidebar:", topicIndex);
    scrollToTopic(topicIndex);
  };

  // Listen for topic clicks from sidebar
  useEffect(() => {
    if (onTopicClickFromSidebar) {
      // This will be called when a topic is clicked in the sidebar
      const handleSidebarTopicClick = (topicIndex) => {
        handleTopicClickFromSidebar(topicIndex);
      };

      // Store the callback for the sidebar to use
      window.handleSidebarTopicClick = handleSidebarTopicClick;
    }
  }, [onTopicClickFromSidebar]);

  // Handle delayed topic scrolling when chapter changes
  useEffect(() => {
    // Check if there's a pending topic scroll after chapter change
    if (window.pendingTopicScroll !== undefined) {
      const topicIndex = window.pendingTopicScroll;
      console.log("Processing pending topic scroll:", topicIndex);
      delete window.pendingTopicScroll;

      // Small delay to ensure the new chapter content is rendered
      setTimeout(() => {
        scrollToTopic(topicIndex);
      }, 200);
    }
  }, [selectedChapterIndex, topics]);

  const [loading, setLoading] = useState(false);
  // Quiz state
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState(null); // { quizzes: [{question, options, correctIndex, explanation}] }
  const [answers, setAnswers] = useState({}); // { [qIndex]: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const questionRefs = useRef({});
  const [quizOpen, setQuizOpen] = useState(true);
  const pendingJumpIndex = useRef(null);

  // Eligibility and certificate generation
  const [eligible, setEligible] = useState(false);
  const [eligibilityMsg, setEligibilityMsg] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [existingCertId, setExistingCertId] = useState(null);

  const computeEligibility = (enrollCourseRow, courseRow) => {
    try {
      const total =
        (typeof courseRow?.noOfChapters === "number" &&
          courseRow.noOfChapters) ||
        courseRow?.courseJson?.course?.noOfChapters ||
        (Array.isArray(courseRow?.courseJson?.chapters)
          ? courseRow.courseJson.chapters.length
          : 0) ||
        0;

      const cc = enrollCourseRow?.completedChapters;
      let completed = 0;
      if (Array.isArray(cc)) completed = cc.length;
      else if (cc && typeof cc === "object")
        completed = Object.values(cc).filter(Boolean).length;
      const quizDone = !!enrollCourseRow?.quizCompleted;

      if (!total || total <= 0) {
        setEligibilityMsg("Course has no chapters configured.");
        return false;
      }
      if (!quizDone || completed < total) {
        setEligibilityMsg(
          `Complete all chapters (${completed}/${total}) and the quiz to get a certificate.`
        );
        return false;
      }
      setEligibilityMsg("");
      return true;
    } catch {
      setEligibilityMsg("Eligibility could not be determined.");
      return false;
    }
  };

  useEffect(() => {
    const ok = computeEligibility(
      courseInfo?.enrollCourse,
      courseInfo?.course ?? courseInfo?.courses
    );
    setEligible(ok);
  }, [courseInfo?.enrollCourse, courseInfo?.course, courseInfo?.courses]);

  // Prefetch existing certificate (if any) so we can change button label
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        if (!courseId) return;
        const { data } = await axios.get(
          `/api/certificates/by-course?courseId=${encodeURIComponent(courseId)}`
        );
        if (data?.certificateId) setExistingCertId(data.certificateId);
        else setExistingCertId(null);
      } catch (e) {
        setExistingCertId(null);
      }
    };
    fetchExisting();
  }, [courseId]);

  // Use backend value as source of truth when available
  const completedFromProps = (enrollCourse?.completedChapters ?? [])
    .map((c) => Number(c))
    .filter((v) => Number.isFinite(v));

  useEffect(() => {
    console.log(
      "[ChapterContent] enrollCourse.completedChapters:",
      enrollCourse?.completedChapters
    );
    console.log(
      "[ChapterContent] completedFromProps(normalized):",
      completedFromProps
    );
    console.log("[ChapterContent] selectedChapterIndex:", selectedChapterIndex);
  }, [enrollCourse?.completedChapters, selectedChapterIndex]);

  // Restore persisted quiz state from enrollCourse (if exists)
  useEffect(() => {
    const savedScore = enrollCourse?.quizScore;
    const savedCompleted = enrollCourse?.quizCompleted;
    const savedAnswers = enrollCourse?.userQuizAnswers; // expect array or object
    if (typeof savedScore === "number") setScore(savedScore);
    if (savedCompleted) setSubmitted(true);
    if (savedAnswers) {
      // Normalize to object { index: value }
      if (Array.isArray(savedAnswers)) {
        const obj = {};
        savedAnswers.forEach((v, i) => {
          if (v !== null && v !== undefined) obj[i] = v;
        });
        setAnswers(obj);
      } else if (typeof savedAnswers === "object") {
        setAnswers(savedAnswers);
      }
    }
  }, [
    enrollCourse?.quizScore,
    enrollCourse?.quizCompleted,
    enrollCourse?.userQuizAnswers,
  ]);

  // Listen for quiz generation loading events from sidebar
  useEffect(() => {
    const handler = (e) => {
      const { loading } = e.detail || {};
      setQuizLoading(!!loading);
      // If generation finished, refetch quiz
      if (loading === false) {
        fetchQuiz();
      }
    };
    window.addEventListener("quiz-generation", handler);
    return () => window.removeEventListener("quiz-generation", handler);
  }, []);

  // Fetch quiz if available
  const fetchQuiz = async () => {
    try {
      if (!courseId) return;
      const { data } = await axios.get(
        `/api/generate-quiz?courseId=${encodeURIComponent(courseId)}`
      );
      if (data?.quizJSON?.quizzes?.length) {
        setQuizData(data.quizJSON);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  // Listen for question jump events
  useEffect(() => {
    const jumpTo = (idx) => {
      const el = questionRefs.current[idx];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "box-shadow 0.3s ease";
        el.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.35)";
        setTimeout(() => (el.style.boxShadow = ""), 1200);
      }
    };

    const onJump = (e) => {
      const idx = Number(e.detail?.index ?? -1);
      if (!Number.isFinite(idx) || idx < 0) return;

      // If quiz not loaded yet, store pending jump
      if (!quizData?.quizzes?.length || quizLoading) {
        pendingJumpIndex.current = idx;
      }

      // Ensure container is open first
      if (!quizOpen) {
        setQuizOpen(true);
        // Wait for expand transition then jump
        setTimeout(() => jumpTo(idx), 320);
      } else {
        // Already open, jump immediately (or after a tick to ensure render)
        setTimeout(() => jumpTo(idx), 0);
      }
    };
    window.addEventListener("quiz-jump", onJump);
    return () => window.removeEventListener("quiz-jump", onJump);
  }, [quizOpen, quizData?.quizzes?.length, quizLoading]);

  // If a pending jump was set before data loaded, execute when ready
  useEffect(() => {
    if (
      pendingJumpIndex.current != null &&
      quizData?.quizzes?.length &&
      !quizLoading
    ) {
      const idx = pendingJumpIndex.current;
      pendingJumpIndex.current = null;
      if (!quizOpen) setQuizOpen(true);
      setTimeout(
        () => {
          const el = questionRefs.current[idx];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        quizOpen ? 0 : 320
      );
    }
  }, [quizData?.quizzes?.length, quizLoading, quizOpen]);

  const markChapterAsCompleted = async () => {
    setLoading(true);
    const base = completedFromProps.length
      ? completedFromProps
      : localCompletedChapter.map((c) => Number(c));
    const updatedCompleted = Array.from(
      new Set([...base, Number(selectedChapterIndex)])
    );

    try {
      const result = await axios.put("/api/enroll-course", {
        courseId: courseId,
        completedChapter: updatedCompleted,
      });
      console.log("Chapter marked as completed:", result);

      // Update local state only after successful API call
      setLocalCompletedChapter(updatedCompleted);
      toast.success("Chapter Marked As Completed!");

      // Update the courseInfo to reflect changes in sidebar without full refresh
      if (courseInfo?.enrollCourse) {
        courseInfo.enrollCourse.completedChapters = updatedCompleted;
        // Trigger sidebar update
        if (onUpdateTrigger) {
          onUpdateTrigger((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Failed to mark chapter as completed");
    } finally {
      setLoading(false);
    }
  };

  const markInCompletedChapter = async () => {
    setLoading(true);
    const base = completedFromProps.length
      ? completedFromProps
      : localCompletedChapter.map((c) => Number(c));
    const completedChap = base.filter(
      (item) => Number(item) !== Number(selectedChapterIndex)
    );

    try {
      const result = await axios.put("/api/enroll-course", {
        courseId: courseId,
        completedChapter: completedChap,
      });
      console.log("Chapter marked as incomplete:", result);

      // Update local state only after successful API call
      setLocalCompletedChapter(completedChap);
      toast.success("Chapter Marked As InCompleted!");

      // Update the courseInfo to reflect changes in sidebar without full refresh
      if (courseInfo?.enrollCourse) {
        courseInfo.enrollCourse.completedChapters = completedChap;
        // Trigger sidebar update
        if (onUpdateTrigger) {
          onUpdateTrigger((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error marking chapter as incomplete:", error);
      toast.error("Failed to mark chapter as incomplete");
    } finally {
      setLoading(false);
    }
  };

  const isChapterCompleted = (
    completedFromProps.length ? completedFromProps : localCompletedChapter
  )?.some((c) => Number(c) === Number(selectedChapterIndex));

  useEffect(() => {
    console.log("[ChapterContent] isChapterCompleted:", isChapterCompleted);
  }, [isChapterCompleted]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Chapter Header with enhanced styling */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-2xl tracking-tight text-slate-800 dark:text-slate-200">
                Chapter {selectedChapterIndex + 1}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                {courseContent?.[selectedChapterIndex]?.CourseData?.chapterName}
              </p>
            </div>
          </div>

          {/* Enhanced Completion Button */}
          {!isChapterCompleted ? (
            <Button
              onClick={() => markChapterAsCompleted()}
              disabled={loading}
              className="
                h-12 px-6 rounded-xl inline-flex items-center gap-3
                bg-gradient-to-r from-emerald-500 to-emerald-600
                hover:from-emerald-600 hover:to-emerald-700
                text-white shadow-lg hover:shadow-xl
                transition-all duration-200 ease-in-out
                focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {loading ? "Marking..." : "Mark as Completed"}
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => markInCompletedChapter()}
              disabled={loading}
              className="
                h-12 px-6 rounded-xl inline-flex items-center gap-3
                border-2 border-emerald-200 dark:border-emerald-700
                bg-emerald-50 dark:bg-emerald-900/20
                hover:bg-emerald-100 dark:hover:bg-emerald-800/30
                text-emerald-700 dark:text-emerald-300
                shadow-lg hover:shadow-xl
                transition-all duration-200 ease-in-out
                focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span className="font-medium">
                {loading ? "Updating..." : "Mark as Incomplete"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Videos Section with enhanced styling */}
      {videoData && videoData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Video className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">
              Related Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoData?.map(
              (video, index) =>
                index < 2 && (
                  <div
                    key={index}
                    className="
                      group rounded-2xl border bg-white/80 dark:bg-slate-800/80 backdrop-blur-md
                      border-slate-200/60 dark:border-slate-700/60
                      shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300
                      hover:scale-[1.02]
                    "
                  >
                    <div className="relative aspect-video bg-black/80">
                      <YouTube
                        videoId={video?.videoId}
                        className="absolute inset-0 h-full w-full"
                        opts={{
                          height: "100%",
                          width: "100%",
                          playerVars: {
                            rel: 0,
                            modestbranding: 1,
                          },
                        }}
                      />
                    </div>
                    <div className="px-6 py-4">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">
                        {video?.title || `Video ${index + 1}`}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {video?.channelTitle || "YouTube"}
                      </p>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* Topics Section with enhanced styling */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">
              Chapter Topics
            </h2>
          </div>

          {/* Enhanced Expand/Collapse Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => {
                const next = {};
                topics?.forEach((_, i) => (next[i] = true));
                setOpenTopics(next);
              }}
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setOpenTopics({})}
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse All
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {topics?.map((topic, index) => {
            const isOpen = !!openTopics?.[index];
            return (
              <div
                key={index}
                ref={(el) => (topicRefs.current[index] = el)}
                className="
                  rounded-xl border bg-white/60 dark:bg-slate-700/40
                  border-slate-200/60 dark:border-slate-600/60
                  shadow-sm hover:shadow-md transition-all duration-200
                  overflow-hidden
                "
              >
                <div className="flex items-start justify-between gap-4 p-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-200 pt-1">
                      {topic?.topic}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="
                      h-10 w-10 rounded-lg text-slate-500 dark:text-slate-400
                      hover:text-slate-700 dark:hover:text-slate-200
                      hover:bg-slate-100 dark:hover:bg-slate-600
                      transition-all duration-200
                    "
                    onClick={() =>
                      setOpenTopics((prev) => ({
                        ...prev,
                        [index]: !prev?.[index],
                      }))
                    }
                    aria-expanded={isOpen}
                    aria-controls={`topic-content-${index}`}
                  >
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div
                  id={`topic-content-${index}`}
                  className={`
                    overflow-hidden transition-all duration-300 ease-out
                    ${
                      isOpen
                        ? "max-h-[4000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  <div className="px-6 pb-6">
                    <div
                      dangerouslySetInnerHTML={{ __html: topic?.content }}
                      style={{ lineHeight: "1.8" }}
                      className="
                        prose prose-slate dark:prose-invert max-w-none
                        prose-p:my-3 prose-li:my-2 prose-code:px-2 prose-code:py-1
                        prose-code:bg-slate-100 dark:prose-code:bg-slate-700
                        prose-code:rounded prose-code:text-sm
                        prose-headings:text-slate-800 dark:prose-headings:text-slate-200
                        prose-p:text-slate-700 dark:prose-p:text-slate-300
                      "
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-200">
            Quizzes
          </h2>
          <div className="flex items-center gap-2">
            {submitted && (
              <div className="text-sm font-semibold px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Score: {score} / 10
              </div>
            )}
            <Button
              variant={eligible ? "default" : "outline"}
              size="sm"
              disabled={!eligible || issuing}
              onClick={async () => {
                try {
                  setIssuing(true);
                  // First try to fetch existing certificate for this course
                  try {
                    const { data: exist } = await axios.get(
                      `/api/certificates/by-course?courseId=${encodeURIComponent(
                        courseId
                      )}`
                    );
                    if (exist?.certificateId) {
                      window.location.href = `/certificates/${encodeURIComponent(
                        exist.certificateId
                      )}/print`;
                      return;
                    }
                  } catch (err) {
                    // not found; proceed to create
                  }

                  const { data } = await axios.post("/api/certificates/issue", {
                    courseId,
                  });
                  if (data?.certificateId) {
                    try {
                      // Fetch course name for nicer notification, fallback gracefully
                      let courseName =
                        courseInfo?.course?.name || courseInfo?.courses?.name;
                      if (!courseName) {
                        try {
                          const { data: courseResp } = await axios.get(
                            `/api/courses?courseId=${encodeURIComponent(
                              courseId
                            )}`
                          );
                          courseName = courseResp?.name || courseName;
                        } catch (_) {}
                      }
                      const evt = new CustomEvent("certificate-issued", {
                        detail: {
                          courseId,
                          courseName: courseName || "Course",
                          certificateId: data.certificateId,
                          issuedAt: Date.now(),
                        },
                      });
                      window.dispatchEvent(evt);
                    } catch (_) {}
                    window.location.href = `/certificates/${encodeURIComponent(
                      data.certificateId
                    )}/print`;
                  } else {
                    toast.error("Could not issue certificate.");
                  }
                } catch (e) {
                  const msg =
                    e?.response?.data?.message ||
                    e?.response?.data?.error ||
                    "Not eligible yet.";
                  toast.error(msg);
                } finally {
                  setIssuing(false);
                }
              }}
              className="h-9 px-4 rounded-lg"
              title={eligible ? "Generate your certificate" : eligibilityMsg}
            >
              {issuing
                ? existingCertId
                  ? "Opening…"
                  : "Generating…"
                : eligible
                ? existingCertId
                  ? "Open Certificate"
                  : "Generate Certificate"
                : "Certificate Locked"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-lg border-slate-200 dark:border-slate-600"
              onClick={() => setQuizOpen((v) => !v)}
            >
              {quizOpen ? (
                <span className="inline-flex items-center gap-1">
                  <ChevronUp className="h-4 w-4" /> Collapse
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ChevronDown className="h-4 w-4" /> Expand
                </span>
              )}
            </Button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            quizOpen ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {/* Loading indicator from generation */}
          {quizLoading && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Generating quiz…</span>
            </div>
          )}

          {/* When quiz available */}
          {!quizLoading && quizData?.quizzes?.length ? (
            <div>
              <div className="space-y-6">
                {quizData.quizzes.map((q, qi) => {
                  const userAns = answers[qi];
                  const isCorrect = submitted && userAns === q.correctIndex;
                  const isWrong = submitted && userAns !== q.correctIndex;
                  return (
                    <div
                      key={qi}
                      ref={(el) => (questionRefs.current[qi] = el)}
                      className={`rounded-xl border p-4 ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/20"
                          : isWrong
                          ? "border-rose-300 bg-rose-50/60 dark:bg-rose-900/20"
                          : "border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-700/40"
                      }`}
                    >
                      <div className="font-semibold mb-3 text-slate-800 dark:text-slate-200">
                        {qi + 1}. {q.question}
                      </div>
                      <div className="grid gap-2">
                        {q.options.map((opt, oi) => {
                          const selected = userAns === oi;
                          const showCorrect =
                            submitted && oi === q.correctIndex;
                          const showWrong =
                            submitted && selected && oi !== q.correctIndex;
                          return (
                            <label
                              key={oi}
                              className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                                selected
                                  ? "border-blue-400 bg-blue-50/60 dark:bg-blue-900/20"
                                  : "border-slate-200 dark:border-slate-600"
                              } ${showCorrect ? "!border-emerald-400" : ""} ${
                                showWrong ? "!border-rose-400" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${qi}`}
                                className="h-4 w-4"
                                disabled={submitted}
                                checked={selected || false}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [qi]: oi }))
                                }
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {submitted && (
                        <div
                          className={`mt-4 rounded-xl border p-4 transition-colors ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/10"
                              : "border-rose-300 bg-rose-50/60 dark:bg-rose-900/10"
                          }`}
                          style={{
                            boxShadow: isCorrect
                              ? "0 1px 0 rgba(16,185,129,0.15)"
                              : "0 1px 0 rgba(244,63,94,0.15)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <X className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                              )}
                              <span
                                className={`text-sm font-semibold ${
                                  isCorrect
                                    ? "text-emerald-800 dark:text-emerald-300"
                                    : "text-rose-800 dark:text-rose-300"
                                }`}
                              >
                                {isCorrect
                                  ? "Correct Answer"
                                  : "Incorrect Answer"}
                              </span>
                            </div>
                            {!isCorrect && (
                              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 border border-rose-200/70 dark:border-rose-800/50">
                                Correct: {q.options[q.correctIndex]}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-[13.5px] leading-7 text-slate-700 dark:text-slate-300">
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!submitted && (
                <div className="mt-6">
                  <Button
                    onClick={async () => {
                      // Ensure all answered
                      const allAnswered = quizData.quizzes.every(
                        (_, idx) => answers[idx] !== undefined
                      );
                      if (!allAnswered) {
                        toast.error(
                          "Please answer all questions before submitting"
                        );
                        return;
                      }
                      // Grade
                      const s = quizData.quizzes.reduce(
                        (acc, q, idx) =>
                          acc + (answers[idx] === q.correctIndex ? 1 : 0),
                        0
                      );
                      setScore(s);
                      setSubmitted(true);
                      try {
                        const results = quizData.quizzes.map(
                          (q, idx) => answers[idx] === q.correctIndex
                        );
                        const answersArray = Array.from({
                          length: quizData.quizzes.length,
                        }).map((_, i) => answers[i] ?? null);
                        await axios.put("/api/enroll-course/quiz", {
                          courseId,
                          score: s,
                          completed: true,
                          userQuizAnswers: answersArray,
                          userQuizResults: results,
                        });
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="h-11 px-6 rounded-xl"
                  >
                    Submit Answers
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !quizLoading && (
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Click "Generate Quiz" in the sidebar to create a 10-question
                quiz for this course.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterContent;
