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
    <div className="p-0 md:p-4 max-w-6xl mx-auto space-y-8">
      {/* Chapter Header with enhanced styling */}
      <div className="bg-ev-surface-container-low rounded-[2.5rem] p-6 shadow-sm border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-ev-surface-container-highest rounded-2xl flex-shrink-0">
              <BookOpen className="h-8 w-8 text-ev-primary" />
            </div>
            <div>
              <h2 className="font-bold text-2xl md:text-3xl tracking-tight text-ev-on-surface mb-1">
                Chapter {selectedChapterIndex + 1}
              </h2>
              <p className="text-lg text-ev-on-surface-variant font-medium">
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
                h-14 px-8 rounded-full inline-flex items-center gap-3
                bg-ev-tertiary-fixed text-[#0f1411] font-bold text-base
                shadow-[0_0_12px_rgba(188,245,64,0.4)] hover:shadow-[0_0_20px_rgba(188,245,64,0.6)]
                hover:scale-105 active:scale-95
                transition-all duration-300 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <Loader2Icon className="h-6 w-6 animate-spin" />
              ) : (
                <CheckCircle className="h-6 w-6" />
              )}
              <span>
                {loading ? "Marking..." : "Mark as Completed"}
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => markInCompletedChapter()}
              disabled={loading}
              className="
                h-14 px-8 rounded-full inline-flex items-center gap-3
                border-0 bg-ev-secondary-container text-ev-on-surface
                hover:bg-ev-surface-container-highest font-bold text-base
                shadow-sm hover:shadow-md
                hover:scale-105 active:scale-95
                transition-all duration-300 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <Loader2Icon className="h-6 w-6 animate-spin" />
              ) : (
                <X className="h-6 w-6" />
              )}
              <span>
                {loading ? "Updating..." : "Mark as Incomplete"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Videos Section with enhanced styling */}
      {videoData && videoData.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="p-2.5 bg-ev-surface-container rounded-xl">
              <Video className="h-6 w-6 text-ev-primary" />
            </div>
            <h2 className="font-bold text-2xl tracking-tight text-ev-on-surface">
              Related Videos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoData?.map(
              (video, index) =>
                index < 2 && (
                  <div
                    key={index}
                    className="
                      group rounded-[2rem] bg-ev-surface-container-low border-0
                      shadow-sm hover:shadow-md overflow-hidden transition-all duration-300
                      hover:-translate-y-1
                    "
                  >
                    <div className="relative aspect-video bg-black rounded-t-[2rem]">
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
                    <div className="px-6 py-5">
                      <h3 className="text-[1.1rem] font-bold text-ev-on-surface line-clamp-2 mb-2">
                        {video?.title || `Video ${index + 1}`}
                      </h3>
                      <p className="text-sm font-medium text-ev-on-surface-variant uppercase tracking-wider">
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
      <div className="bg-ev-surface-container-low rounded-[2.5rem] p-6 lg:p-8 shadow-sm border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-ev-surface-container-highest rounded-xl">
              <Play className="h-6 w-6 text-ev-primary" />
            </div>
            <h2 className="font-bold text-2xl tracking-tight text-ev-on-surface">
              Chapter Topics
            </h2>
          </div>

          {/* Enhanced Expand/Collapse Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-5 rounded-full bg-ev-surface text-ev-on-surface border-0 hover:bg-ev-surface-container-highest font-bold shadow-sm"
              onClick={() => {
                const next = {};
                topics?.forEach((_, i) => (next[i] = true));
                setOpenTopics(next);
              }}
            >
              <ChevronDown className="h-5 w-5 mr-1.5" />
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-5 rounded-full bg-ev-surface text-ev-on-surface border-0 hover:bg-ev-surface-container-highest font-bold shadow-sm"
              onClick={() => setOpenTopics({})}
            >
              <ChevronUp className="h-5 w-5 mr-1.5" />
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
                  rounded-3xl bg-ev-surface-container
                  border-0 shadow-[0_2px_12px_rgba(0,0,0,0.02)]
                  hover:bg-ev-surface-container-high transition-colors duration-300
                  overflow-hidden
                "
              >
                <div 
                  className="flex items-start justify-between gap-4 p-6 cursor-pointer"
                  onClick={() =>
                    setOpenTopics((prev) => ({
                      ...prev,
                      [index]: !prev?.[index],
                    }))
                  }
                >
                  <div className="flex items-start gap-5 flex-1">
                    <div className="h-10 w-10 flex items-center justify-center bg-ev-primary rounded-full flex-shrink-0">
                      <span className="text-base font-bold text-ev-surface">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl tracking-tight text-ev-on-surface mt-1.5">
                      {topic?.topic}
                    </h3>
                  </div>

                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-ev-surface-container-highest text-ev-on-surface-variant flex-shrink-0 mt-0.5">
                    {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
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
                  <div className="px-6 pb-8 pl-[4.5rem]">
                    <div
                      dangerouslySetInnerHTML={{ __html: topic?.content }}
                      style={{ lineHeight: "1.8" }}
                      className="
                        prose prose-slate dark:prose-invert max-w-none
                        prose-p:my-4 prose-p:text-[1rem] prose-p:leading-loose
                        prose-li:my-2 prose-code:px-2 prose-code:py-1
                        prose-code:bg-ev-surface-container-highest
                        prose-code:rounded-lg prose-code:text-sm prose-code:font-bold
                        prose-headings:text-ev-on-surface prose-headings:font-bold
                        prose-p:text-ev-on-surface-variant
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
      <div className="bg-ev-surface-container-low rounded-[2.5rem] p-6 lg:p-8 shadow-sm border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-ev-surface-container-highest rounded-xl">
              <CheckCircle className="h-6 w-6 text-ev-primary" />
            </div>
            <h2 className="font-bold text-2xl tracking-tight text-ev-on-surface">
              Quizzes
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {submitted && (
              <div className="text-sm font-bold px-4 py-2 rounded-full bg-ev-tertiary-container text-ev-on-tertiary-container">
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
              className={`h-10 px-5 rounded-full font-bold transition-all duration-300 ${
                eligible
                  ? "bg-ev-primary text-ev-on-primary hover:scale-105 active:scale-95 shadow-sm hover:shadow-md border-0"
                  : "bg-ev-surface-container text-ev-on-surface-variant cursor-not-allowed border-0"
              }`}
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
              className="h-10 px-5 rounded-full bg-ev-surface text-ev-on-surface border-0 hover:bg-ev-surface-container-highest font-bold shadow-sm"
              onClick={() => setQuizOpen((v) => !v)}
            >
              {quizOpen ? (
                <span className="inline-flex items-center gap-1.5">
                  <ChevronUp className="h-5 w-5" /> Collapse
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <ChevronDown className="h-5 w-5" /> Expand
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
                      className={`rounded-3xl border-0 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors duration-300 ${
                        isCorrect
                          ? "bg-ev-tertiary-container text-ev-on-tertiary-container"
                          : isWrong
                          ? "bg-rose-500/10 text-ev-on-surface"
                          : "bg-ev-surface-container"
                      }`}
                    >
                      <div className="font-bold text-lg mb-5 text-ev-on-surface">
                        {qi + 1}. {q.question}
                      </div>
                      <div className="grid gap-3">
                        {q.options.map((opt, oi) => {
                          const selected = userAns === oi;
                          const showCorrect =
                            submitted && oi === q.correctIndex;
                          const showWrong =
                            submitted && selected && oi !== q.correctIndex;
                          return (
                            <label
                              key={oi}
                              className={`flex items-center gap-4 p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                selected
                                  ? "border-ev-primary bg-ev-surface-container-highest"
                                  : "border-transparent bg-ev-surface-container-high hover:bg-ev-surface-container-highest"
                              } ${showCorrect ? "!border-emerald-500/50 !bg-emerald-500/10" : ""} ${
                                showWrong ? "!border-rose-500/50 !bg-rose-500/10" : ""
                              }`}
                            >
                              <div
                                className={`h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                                  selected
                                    ? "bg-ev-primary border-0"
                                    : "border-2 border-ev-on-surface-variant bg-transparent"
                                }`}
                              >
                                {selected && <div className="h-2 w-2 rounded-full bg-ev-surface" />}
                              </div>
                              <input
                                type="radio"
                                name={`q-${qi}`}
                                className="hidden"
                                disabled={submitted}
                                checked={selected || false}
                                onChange={() =>
                                  setAnswers((prev) => ({ ...prev, [qi]: oi }))
                                }
                              />
                              <span className="text-[1.05rem] font-medium text-ev-on-surface">
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {submitted && (
                        <div
                          className={`mt-6 rounded-2xl border-0 p-5 transition-colors ${
                            isCorrect
                              ? "bg-ev-surface-container-high"
                              : "bg-rose-500/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {isCorrect ? (
                                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                  <CheckCircle className="h-6 w-6" />
                                </div>
                              ) : (
                                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                                  <X className="h-6 w-6" />
                                </div>
                              )}
                              <span
                                className={`text-base font-bold tracking-wide uppercase ${
                                  isCorrect
                                    ? "text-emerald-500"
                                    : "text-rose-500"
                                }`}
                              >
                                {isCorrect
                                  ? "Correct Answer"
                                  : "Incorrect Answer"}
                              </span>
                            </div>
                            {!isCorrect && (
                              <span className="text-sm font-bold rounded-full px-4 py-1.5 bg-ev-surface-container-highest text-ev-on-surface">
                                Correct: {q.options[q.correctIndex]}
                              </span>
                            )}
                          </div>

                          <div className="text-[1rem] leading-relaxed text-ev-on-surface-variant font-medium">
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!submitted && (
                <div className="mt-8 flex justify-end">
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
                    className="
                      h-12 px-8 rounded-full inline-flex items-center gap-3
                      bg-ev-primary text-ev-on-primary font-bold text-base
                      shadow-sm hover:shadow-md
                      hover:scale-105 active:scale-95
                      transition-all duration-300 ease-out
                      border-0
                    "
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
