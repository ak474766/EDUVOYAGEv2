"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../@/components/ui/button";
import { Input } from "../../../@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../@/components/ui/select";
import {
  Bot,
  User,
  Sparkles,
  Send,
  Paperclip,
  Loader2,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Target,
  Zap,
  LayoutDashboard,
  Compass,
  History,
  Plus,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const formatSkillAnalysisToHtml = (data) => {
  return (
    <div className="font-sans space-y-6 text-[#191c1a] dark:text-[#e1e3df]">
      {data.summary && (
        <div className="bg-[#bcf540]/10 border border-[#bcf540]/30 rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-[#bcf540] shrink-0 mt-1" />
            <p className="text-sm font-medium leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>
      )}

      {data.roleFit && Object.keys(data.roleFit).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
            <Target className="h-4 w-4" /> Role Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(data.roleFit).map(([role, fit], idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1a231d] rounded-2xl p-4 border border-[#e1e3df] dark:border-white/5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 h-1 bg-[#bcf540]"
                  style={{ width: `${fit.match}%` }}
                ></div>
                <div className="flex justify-between items-center mb-2 mt-1">
                  <h4 className="font-bold text-sm">{role}</h4>
                  <span className="text-xs font-black bg-[#e7eee8] dark:bg-[#1f2b23] text-[#4e6354] dark:text-[#bcf540] px-2 py-1 rounded-md">
                    {fit.match}%
                  </span>
                </div>
                <p className="text-xs text-ev-on-surface-variant font-medium leading-relaxed">
                  {fit.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skillGaps && data.skillGaps.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Skill Gaps
          </h3>
          <div className="space-y-3">
            {data.skillGaps.map((gap, idx) => (
              <div
                key={idx}
                className="bg-[#f8faf6] dark:bg-[#151c17] rounded-xl p-4 border border-[#e1e3df] dark:border-white/5 border-l-4 border-l-[#ff5b5b]"
              >
                <h4 className="font-bold text-sm mb-1">{gap.skill}</h4>
                <p className="text-xs text-ev-on-surface-variant mb-2">
                  <strong>Why:</strong> {gap.why}
                </p>
                <p className="text-xs text-[#4e6354] dark:text-[#bcf540] font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {gap.how}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.learningPath && data.learningPath.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
            <Compass className="h-4 w-4" /> Recommended Path
          </h3>
          <div className="space-y-4">
            {data.learningPath.map((path, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1a231d] rounded-2xl p-4 border border-[#e1e3df] dark:border-white/5"
              >
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#bcf540]" /> Focus:{" "}
                  {path.skill}
                </h4>
                <div className="space-y-2">
                  {path.chapters?.map((ch, cidx) => (
                    <div
                      key={cidx}
                      className="bg-[#f8faf6] dark:bg-[#111613] p-3 rounded-lg border border-[#e1e3df] dark:border-white/5 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">{ch.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ev-on-surface-variant bg-ev-surface-container-high px-2 rounded-full">
                          {ch.hours} hrs
                        </span>
                      </div>
                      <p className="text-[11px] text-ev-on-surface-variant">
                        {ch.topics?.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VoyagerLogo = ({ isLoading, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      videoRef.current
        ?.play()
        .catch((e) => console.log("Video auto-play blocked:", e));
    } else {
      videoRef.current?.pause();
    }
  }, [isLoading]);

  const handleMouseEnter = () => {
    if (!isLoading) {
      videoRef.current
        ?.play()
        .catch((e) => console.log("Video play on hover blocked:", e));
    }
  };

  const handleMouseLeave = () => {
    if (!isLoading) {
      videoRef.current?.pause();
    }
  };

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-[#212121] shadow-none ring-0 transition-all duration-500 ${isLoading ? "ring-1 ring-[#bcf540]/30 shadow-[0_0_15px_rgba(188,245,64,0.15)] scale-105" : ""} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src="/Untitled%20file.webm"
        className="w-[120%] h-[120%] object-cover"
        loop
        muted
        playsInline
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
};

function AiTools() {
  const { user } = useUser();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("voyager_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          setActiveModel(parsed[0].model || "career");
        } else {
          createNewChat();
        }
      } catch (e) {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  const createNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      model: "career",
      messages: [
        {
          id: 1,
          type: "bot",
          content:
            "Welcome to Voyager AI. I am your Career Advisor. How can I help you today?",
          timestamp: new Date().toISOString(),
          isHtml: false,
        },
      ],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveModel("career");
  };

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("voyager_history", JSON.stringify(sessions));
    }
  }, [sessions]);

  const updateSession = (updater) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return updater(s);
        }
        return s;
      }),
    );
  };

  const setMessages = (updaterFn) => {
    updateSession((s) => {
      const newMessages =
        typeof updaterFn === "function" ? updaterFn(s.messages) : updaterFn;
      let title = s.title;
      if (title === "New Chat" && newMessages.length > 1) {
        const userMsg = newMessages.find((m) => m.type === "user");
        if (userMsg) {
          title = userMsg.content.substring(0, 30) + "...";
        }
      }
      return { ...s, title, messages: newMessages };
    });
  };

  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const messages = currentSession ? currentSession.messages : [];

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState("career");

  // Resume Analyzer Popup State
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResumeText, setExtractedResumeText] = useState("");

  // MCQ State for pop up
  const [mcqStep, setMcqStep] = useState(1);
  const [resumeTargets, setResumeTargets] = useState("Frontend Developer");
  const [resumeYoe, setResumeYoe] = useState("0-1");
  const [primaryGoal, setPrimaryGoal] = useState("Job Search");
  const [learningStyle, setLearningStyle] = useState("Project-based");

  const [enhancingMessage, setEnhancingMessage] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModelChange = (val) => {
    setActiveModel(val);
    updateSession((s) => ({ ...s, model: val }));
    let msg = "";
    if (val === "resume") {
      msg =
        "You have selected the **Resume Analyzer**. Please click the attachment (paperclip) icon below to upload your resume and specify your target roles.";
    } else if (val === "tutor") {
      msg =
        "You have selected the **AI Tutor**. Please note this feature is currently in Beta. You can ask me any learning-specific queries!";
    } else {
      msg =
        "You are now using the **Career Advisor**. Ask me anything regarding your career trajectory or upcoming interviews.";
    }
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "bot",
        content: msg,
        timestamp: new Date().toISOString(),
        isHtml: false,
      },
    ]);
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && activeModel !== "resume") || isLoading) return;

    if (activeModel === "resume" && !inputMessage.trim()) {
      setMcqStep(1);
      setShowResumePopup(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      isHtml: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      if (activeModel === "career") {
        const result = await axios.post("/api/ai-career-advisor", {
          message: inputMessage,
        });

        if (result.data.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              content: result.data.response,
              timestamp: new Date().toISOString(),
              isHtml: false,
            },
          ]);
        } else {
          toast.error("Failed to get response. Please try again.");
        }
      } else if (activeModel === "tutor") {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "bot",
              content:
                "The advanced AI Tutor module is currently under training and will be available soon. Please switch to the Career Advisor for now.",
              timestamp: new Date().toISOString(),
              isHtml: false,
            },
          ]);
          setIsLoading(false);
        }, 1000);
        return; // handle async
      } else if (activeModel === "resume") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "bot",
            content:
              "Please use the attachment icon to upload your resume for analysis.",
            timestamp: new Date().toISOString(),
            isHtml: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Voyager AI Error:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const enhanceMessage = async () => {
    if (!inputMessage.trim() || enhancingMessage) return;

    try {
      setEnhancingMessage(true);
      const result = await axios.post("/api/chat-enhancement", {
        text: inputMessage,
      });

      if (result.data.success) {
        setInputMessage(result.data.enhancedText);
        toast.success("Question enhanced successfully!");
      } else {
        toast.error("Failed to enhance question. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to enhance question.");
    } finally {
      setEnhancingMessage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    setResumeFiles(files);

    if (files.length > 0) {
      setIsExtracting(true);
      try {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const res = await axios.post("/api/extract-text", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (
          res.data.success &&
          res.data.text &&
          res.data.text.trim().length > 10
        ) {
          setExtractedResumeText(res.data.text);
          setMcqStep(2); // Proceed to next section
        } else {
          toast.error(
            "Could not read enough text from the resume. Please try a different file.",
          );
          setResumeFiles([]); // Reset
        }
      } catch (error) {
        console.error("Resume extraction error:", error);
        toast.error(
          "Failed to read resume. Please ensure it's a valid PDF/DOCX/TXT.",
        );
        setResumeFiles([]); // Reset
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleResumeSubmit = async () => {
    if (!extractedResumeText) {
      toast.error("No resume text found. Please upload again.");
      return;
    }

    setShowResumePopup(false);

    // Echo user intention
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "user",
        content: `I've attached my resume to be analyzed for target roles: **${resumeTargets}**. My primary goal is **${primaryGoal}**.`,
        timestamp: new Date().toISOString(),
        isHtml: false,
      },
    ]);

    setIsLoading(true);
    try {
      const res = await axios.post("/api/skill-analyzer", {
        text: extractedResumeText,
        targets: resumeTargets
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        stack: [learningStyle],
        yoe: resumeYoe,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "Analysis completed.",
          rawData: res.data,
          timestamp: new Date().toISOString(),
          isHtml: true,
        },
      ]);
    } catch (e) {
      toast.error("Analysis failed. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content:
            "Sorry, I encountered an error while trying to analyze your resume.",
          timestamp: new Date().toISOString(),
          isHtml: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setResumeFiles([]);
      setMcqStep(1); // Reset
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#212121]/60 backdrop-blur-3xl font-sans text-gray-200 relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-none items-center justify-between p-6 shrink-0 bg-transparent z-20 border-b border-white/5 shadow-sm min-h-[72px]">
        <div className="flex-1 flex items-center gap-2 px-2 text-xl font-bold text-gray-100 uppercase tracking-tighter">
          Voyager AI
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[12px] font-extrabold px-5 py-1.5 rounded-full bg-[#2a2a2a] text-gray-300 tracking-widest uppercase flex items-center gap-2 border border-white/5">
            {activeModel === "resume" ? (
              <>
                <FileText className="w-3.5 h-3.5 text-[#bcf540]" /> Resume
                Analyzer
              </>
            ) : activeModel === "tutor" ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-[#bcf540]" /> AI
                Tutor
              </>
            ) : (
              <>
                <Briefcase className="w-3.5 h-3.5 text-[#bcf540]" /> Career
                Advisor
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-end flex-1 gap-2 pr-2">
          <Button
            onClick={createNewChat}
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full font-bold"
          >
            <Plus className="w-4 h-4" /> New Chat
          </Button>
          <Button
            onClick={() => setShowHistoryPopup(true)}
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-[#bcf540] hover:bg-white/10 rounded-full transition-colors"
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:px-8 space-y-8 hide-scrollbar relative">
        <div className="max-w-3xl mx-auto flex flex-col space-y-8 pb-4">
          {messages.length === 1 && !isLoading && messages[0].id === 1 && (
            <div className="flex flex-col items-center justify-center mt-20 mb-10 opacity-80">
              <h2 className="text-3xl font-semibold mb-2 text-white">
                Where should we begin?
              </h2>
            </div>
          )}

          {messages.map((message) => {
            if (message.id === 1 && messages.length === 1) return null; // Hide default welcome if it's the only one to show center prompt
            return (
              <div
                key={message.id}
                className={`flex w-full ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "user" ? (
                  <div className="bg-[#2f2f2f] text-gray-100 px-5 py-3 rounded-[1.5rem] max-w-[85%] md:max-w-[75%] shadow-sm font-medium text-[15px]">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </Markdown>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 w-full">
                    <VoyagerLogo
                      isLoading={false}
                      className="w-8 h-8 flex-shrink-0 mt-1 shadow-none ring-0 border border-gray-700/50"
                    />
                    <div className="flex-1 mt-1 text-[15px] text-gray-200 font-medium leading-relaxed prose prose-sm prose-invert w-full max-w-full overflow-hidden">
                      {message.isHtml ? (
                        message.rawData ? (
                          formatSkillAnalysisToHtml(message.rawData)
                        ) : (
                          message.htmlNode
                        )
                      ) : (
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </Markdown>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex w-full justify-start animate-in fade-in duration-300">
              <div className="flex items-start gap-4">
                <VoyagerLogo
                  isLoading={true}
                  className="w-8 h-8 flex-shrink-0 mt-1 shadow-none ring-0 border border-gray-700/50"
                />
                <div className="mt-3.5 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Bottom Input Area */}
      <div className="p-4 bg-transparent shrink-0 pb-6 w-full relative z-20">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 relative">
          {/* Main ChatGPT-like Input Pill */}
          <div className="relative flex items-center w-full bg-[#2f2f2f] rounded-[2rem] p-2 transition-all focus-within:bg-[#323232] shadow-sm">
            {/* Left Tools Menu (Mode Select) */}
            <Select value={activeModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-600/30 border-none shadow-none text-gray-300 p-0 flex justify-center items-center focus:ring-0 cursor-pointer [&[data-state=open]>div>svg]:rotate-45">
                <div
                  className="flex items-center justify-center relative group"
                  title="Change Mode"
                >
                  <Plus className="h-[24px] w-[24px] transition-transform duration-200" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-700 shadow-xl bg-[#2f2f2f] text-white ml-2 mb-2">
                <SelectItem
                  value="resume"
                  className="rounded-xl font-medium cursor-pointer hover:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Resume Analyzer
                  </div>
                </SelectItem>
                <SelectItem
                  value="career"
                  className="rounded-xl font-medium cursor-pointer hover:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Career Advisor
                  </div>
                </SelectItem>
                <SelectItem
                  value="tutor"
                  className="rounded-xl font-medium cursor-pointer hover:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> AI Tutor
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {activeModel === "resume" ? (
              <button
                onClick={() => {
                  setMcqStep(1);
                  setShowResumePopup(true);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#bcf540]/10 text-[#bcf540] hover:bg-[#bcf540]/20 transition-colors ml-1"
                title="Upload Resume"
              >
                <Paperclip className="h-[20px] w-[20px]" />
              </button>
            ) : null}

            <Input
              placeholder={
                activeModel === "resume"
                  ? "Ask anything or attach resume..."
                  : "Ask anything..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none px-3 h-12 text-[15px] font-medium placeholder:text-gray-400 text-gray-100 disabled:opacity-50"
              disabled={isLoading}
            />

            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              {activeModel !== "resume" && (
                <button
                  type="button"
                  onClick={enhanceMessage}
                  disabled={
                    !inputMessage.trim() || enhancingMessage || isLoading
                  }
                  className="p-2 rounded-full hover:bg-gray-600/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-300"
                  title="Enhance question with AI"
                >
                  {enhancingMessage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-[20px] w-[20px] hover:text-[#bcf540] transition-colors" />
                  )}
                </button>
              )}
              <button
                onClick={handleSendMessage}
                disabled={
                  (!inputMessage.trim() && activeModel !== "resume") ||
                  isLoading
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0 ${!inputMessage.trim() && activeModel !== "resume" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"}`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <Send className="h-4 w-4 -ml-[1px]" />
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-medium text-gray-500 mt-1">
              Powered by Ethereal Grove Labs. AI can make mistakes. Check
              important info.
            </p>
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={showHistoryPopup} onOpenChange={setShowHistoryPopup}>
        <DialogContent className="sm:max-w-md bg-[#212121] border border-white/10 rounded-[1.5rem] shadow-2xl p-6 text-gray-200 overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0 mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-[#bcf540]" /> Chat History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar flex-1">
            <Button
              onClick={createNewChat}
              variant="outline"
              className="w-full flex md:hidden gap-2 mb-4 border-white/20 text-gray-300 hover:text-white rounded-xl font-bold h-12"
            >
              <Plus className="w-4 h-4" /> Start New Chat
            </Button>
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setActiveModel(session.model || "career");
                  setShowHistoryPopup(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${activeSessionId === session.id ? "bg-[#2f2f2f] border-white/10 shadow-sm" : "border-transparent hover:bg-white/5"}`}
              >
                <p className="text-sm font-semibold truncate text-gray-200">
                  {session.title || "New Chat"}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {session.model || "career"} Mode •{" "}
                  {new Date(session.id || Date.now()).toLocaleDateString()}
                </p>
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4 font-medium">
                No chat history found.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Analyzer Popup Dialog - MCQ Based */}
      <Dialog open={showResumePopup} onOpenChange={setShowResumePopup}>
        <DialogContent className="sm:max-w-lg bg-ev-surface-container-lowest rounded-[2rem] border-0 shadow-2xl p-6 sm:p-8">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-[#e7eee8] dark:bg-[#1f2b23] rounded-full flex items-center justify-center mb-4 shadow-inner">
              {mcqStep === 1 ? (
                <FileText className="w-8 h-8 text-[#4e6354] dark:text-[#bcf540]" />
              ) : (
                <LayoutDashboard className="w-8 h-8 text-[#4e6354] dark:text-[#bcf540]" />
              )}
            </div>
            <DialogTitle className="text-xl md:text-2xl font-extrabold text-center text-ev-on-surface">
              {mcqStep === 1 ? "Upload Resume" : "Quick Voyager Questionnaire"}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-ev-on-surface-variant">
              {mcqStep === 1
                ? "Provide your PDF/DOCX/TXT to begin."
                : "Help Voyager understand your goals better."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {mcqStep === 1 ? (
              <div className="border-2 border-dashed border-ev-outline-variant/50 rounded-2xl p-8 text-center hover:bg-ev-surface-container/50 transition-colors cursor-pointer relative overflow-hidden group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isExtracting}
                  accept=".pdf,.docx,.txt"
                  className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 ${isExtracting ? "hidden" : ""}`}
                />
                <div className="mb-4 w-12 h-12 rounded-full bg-ev-primary/10 mx-auto flex items-center justify-center">
                  {isExtracting ? (
                    <Loader2 className="h-6 w-6 text-ev-primary animate-spin" />
                  ) : (
                    <Paperclip className="h-6 w-6 text-ev-primary" />
                  )}
                </div>
                <p className="text-base font-bold text-ev-on-surface">
                  {isExtracting
                    ? "Extracting text..."
                    : resumeFiles.length > 0
                      ? resumeFiles[0].name
                      : "Click or drag resume here (PDF/DOCX/TXT)"}
                </p>
                <p className="text-xs text-ev-on-surface-variant mt-2 font-medium">
                  Max file size 10MB.
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                {/* Question 1 */}
                <div>
                  <p className="text-sm font-bold text-ev-on-surface mb-2">
                    1. What is your primary Goal?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Job Search",
                      "Level Up Skills",
                      "Career Switch",
                      "Freelance",
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setPrimaryGoal(opt)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                          primaryGoal === opt
                            ? "bg-[#bcf540]/10 border-[#bcf540] text-[#4e6354] dark:text-[#bcf540]"
                            : "border-ev-outline-variant/30 hover:border-ev-primary/50 text-ev-on-surface-variant"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div>
                  <p className="text-sm font-bold text-ev-on-surface mb-2">
                    2. Years of Experience?
                  </p>
                  <div className="flex gap-2">
                    {["0-1", "2-4", "5-8", "9+"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setResumeYoe(opt)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                          resumeYoe === opt
                            ? "bg-[#bcf540]/10 border-[#bcf540] text-[#4e6354] dark:text-[#bcf540]"
                            : "border-ev-outline-variant/30 hover:border-ev-primary/50 text-ev-on-surface-variant"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Roles */}
                <div>
                  <p className="text-sm font-bold text-ev-on-surface mb-2">
                    3. Target Roles
                  </p>
                  <Input
                    value={resumeTargets}
                    onChange={(e) => setResumeTargets(e.target.value)}
                    placeholder="e.g. Frontend, Backend, AI..."
                    className="bg-transparent border-ev-outline-variant/30 focus-visible:ring-ev-primary/30 h-11 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            {mcqStep === 1 ? (
              <Button
                onClick={() => setMcqStep(2)}
                disabled={!extractedResumeText || isExtracting}
                className="w-full rounded-full bg-ev-primary hover:bg-ev-primary/90 text-white h-12 font-bold text-base shadow-md disabled:opacity-50 transition-all"
              >
                Continue
              </Button>
            ) : (
              <div className="w-full flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMcqStep(1)}
                  className="flex-1 rounded-full border-ev-outline-variant/30 h-12 font-bold text-base"
                >
                  Back
                </Button>
                <Button
                  onClick={handleResumeSubmit}
                  disabled={isLoading}
                  className="flex-[2] rounded-full bg-ev-primary hover:bg-ev-primary/90 text-white h-12 font-bold text-base shadow-md disabled:opacity-50"
                >
                  Generate Analysis
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AiTools;
