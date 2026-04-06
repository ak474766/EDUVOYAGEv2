"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../@/components/ui/button";
import { Input } from "../../../@/components/ui/input";
import { Progress } from "../../../@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../@/components/ui/tabs";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Clock,
  Loader2,
  Zap,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../@/components/ui/accordion";

function AiTools() {
  const [activeTab, setActiveTab] = useState("career-chat");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Career Advisor. I can help you with career guidance, job search tips, skill development advice, and more. What would you like to know about your career?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enhancingMessage, setEnhancingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const result = await axios.post("/api/ai-career-advisor", {
        message: inputMessage,
      });

      if (result.data.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: "bot",
          content: result.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        toast.error("Failed to get response. Please try again.");
      }
    } catch (error) {
      console.error("AI Career Advisor Error:", error);
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
      console.error("Chat enhancement error:", error);
      if (error.response?.data?.error === "api_key_error") {
        toast.error(
          "API key is invalid or missing. Please check your configuration."
        );
      } else if (error.response?.data?.error === "quota_exceeded") {
        toast.error("API quota exceeded. Please try again later.");
      } else if (error.response?.data?.error === "ai_service_error") {
        toast.error(
          "AI service is currently unavailable. Please try again later."
        );
      } else {
        toast.error("Failed to enhance question. Please try again.");
      }
    } finally {
      setEnhancingMessage(false);
    }
  };

  const suggestedQuestions = [
    "How can I improve my resume?",
    "What are common interview questions?",
    "How do I negotiate salary?",
    "What skills should I learn?",
    "How can I network effectively?",
    "Should I change careers?",
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
              <Bot className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
              AI Tools Hub
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Discover powerful AI-powered tools to enhance your learning
              journey and accelerate your career development
            </p>

            {/* Added feature badges */}
            <div className="flex justify-center gap-4 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-blue-200 dark:border-blue-400/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm">
                <Sparkles className="h-4 w-4" />
                AI Powered
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-purple-200 dark:border-purple-400/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 shadow-sm">
                <Zap className="h-4 w-4" />
                Instant Results
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-2 h-auto">
            <TabsTrigger
              value="career-chat"
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-gray-50 dark:hover:bg-neutral-900/40"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Career Q&A Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai-tutor"
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-gray-50 dark:hover:bg-neutral-900/40"
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger
              value="skill-analyzer"
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-gray-50 dark:hover:bg-neutral-900/40"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Skill Analyzer</span>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Career Q&A Chat Tab */}
          <TabsContent value="career-chat" className="space-y-6">
            <Card className="bg-white/90 dark:bg-neutral-900/60 backdrop-blur-md shadow-2xl border border-gray-100/60 dark:border-white/10 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Bot className="h-6 w-6" />
                  </div>
                  AI Career Advisor
                </CardTitle>
                <p className="text-blue-100 font-normal text-lg">
                  Get personalized career guidance, interview tips, and
                  professional advice
                </p>
              </CardHeader>

              <CardContent className="p-0">
                {/* Enhanced Chat Messages */}
                <div className="h-[60vh] md:h-96 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-neutral-900/40 dark:to-neutral-900/10">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white transform hover:scale-[1.02]"
                            : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 transform hover:scale-[1.02]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {message.type === "bot" && (
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                              <Bot className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                            </div>
                          )}
                          <div className="flex-1">
                            {message.type === "bot" ? (
                              <Markdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </Markdown>
                            ) : (
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                            )}
                            <p
                              className={`text-xs mt-2 font-medium ${
                                message.type === "user"
                                  ? "text-blue-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {message.type === "user" && (
                            <div className="p-1.5 bg-white/20 dark:bg-white/10 rounded-lg">
                              <User className="h-4 w-4 text-white flex-shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                            <Bot className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Suggested Questions */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-white/5 dark:to-white/0 border-t border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                      Quick Start Questions:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInputMessage(question)}
                        className="text-xs bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 hover:border-blue-300 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all duration-300 rounded-xl border-gray-200"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Input Area */}
                <div className="p-6 bg-white dark:bg-neutral-900/60 border-t border-gray-100 dark:border-white/10">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Ask me anything about your career..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-20 border-2 border-gray-200 dark:border-white/10 bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm focus:border-blue-400 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 rounded-2xl h-12 text-base transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={enhanceMessage}
                          disabled={
                            !inputMessage.trim() ||
                            enhancingMessage ||
                            isLoading
                          }
                          className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                          title="Enhance question with AI for better career advice"
                        >
                          {enhancingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 h-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Sending...</span>
                        </div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced AI Tutor Tab */}
          <TabsContent value="ai-tutor" className="space-y-6">
            <Card className="bg-white/90 dark:bg-neutral-900/60 backdrop-blur-md shadow-2xl border border-gray-100/60 dark:border-white/10 rounded-3xl overflow-hidden">
              <CardContent className="p-16 text-center relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="grid grid-cols-8 gap-4 h-full">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div key={i} className="bg-blue-400 dark:bg-white rounded-full"></div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 rounded-3xl flex items-center justify-center shadow-xl">
                    <BookOpen className="h-16 w-16 text-blue-500 dark:text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                      AI Tutor
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-lg leading-relaxed">
                      Get personalized tutoring and learning assistance powered
                      by advanced AI technology.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-500/15 dark:to-orange-500/15 text-yellow-800 dark:text-yellow-300 rounded-2xl text-sm font-semibold shadow-lg">
                    <Clock className="h-5 w-5" />
                    Coming Soon - Stay Tuned!
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skill Analyzer Tab */}
          <TabsContent value="skill-analyzer" className="space-y-6">
            <SkillAnalyzerPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AiTools;

function ScoreDonut({ value }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circumference - (clamped / 100) * circumference;
  const status =
    clamped < 60 ? "Needs Work" : clamped < 80 ? "Good Start" : "Excellent";
  const statusColor =
    clamped < 60
      ? "text-red-600"
      : clamped < 80
      ? "text-amber-600"
      : "text-green-600";
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="rotate-[-90deg]">
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="url(#g)"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="-mt-24 text-center">
        <div className="text-4xl font-extrabold">{clamped}</div>
        <div className={`text-sm font-semibold ${statusColor}`}>{status}</div>
      </div>
    </div>
  );
}

function SkillAnalyzerPanel() {
  const { user } = useUser();
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [targets, setTargets] = useState("");
  const [yoe, setYoe] = useState("");
  const [stack, setStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  // Auto-scroll to result when it appears to keep alignment clean
  useEffect(() => {
    if (result && resultRef?.current) {
      try {
        resultRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } catch {}
    }
  }, [result]);

  const onFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    if (f.some((x) => x.size > 10 * 1024 * 1024)) {
      toast.error("File too large (max 10MB)");
      return;
    }
    if (f.length > 5) {
      toast.error("Max 5 files");
      return;
    }
    setFiles(f);
  };

  const analyze = async () => {
    try {
      // Check if text or files are provided
      if (!text && files.length === 0) {
        toast.error("Provide text or upload files");
        return;
      }

      // Validate required fields
      const hasTargets = targets.trim() !== "";
      const hasYoe = yoe.trim() !== "";
      const hasStack = stack.trim() !== "";

      // Check what's missing and show specific warnings
      if (!hasTargets && !hasYoe && !hasStack) {
        toast.error(
          "Please fill in Roles, Years of Experience, and Tech Stack"
        );
        return;
      }

      if (hasTargets && !hasYoe && !hasStack) {
        toast.error("Please fill in Years of Experience & Tech Stack");
        return;
      }

      if (hasTargets && hasYoe && !hasStack) {
        toast.error("Please fill in Tech Stack");
        return;
      }

      if (hasTargets && !hasYoe && hasStack) {
        toast.error("Please fill in Years of Experience");
        return;
      }

      if (!hasTargets && hasYoe && !hasStack) {
        toast.error("Please fill in Roles & Tech Stack");
        return;
      }

      if (!hasTargets && hasYoe && hasStack) {
        toast.error("Please fill in Roles");
        return;
      }

      if (!hasTargets && !hasYoe && hasStack) {
        toast.error("Please fill in Roles & Years of Experience");
        return;
      }

      // If we reach here, all fields are filled
      setLoading(true);
      setResult(null);
      const params = {
        targets: targets.split(",").filter(Boolean),
        stack: stack.split(",").filter(Boolean),
        yoe,
      };
      if (mode === "image" && files.length) {
        const fd = new FormData();
        fd.append("text", text);
        fd.append("targets", params.targets.join(","));
        fd.append("stack", params.stack.join(","));
        if (yoe) fd.append("yoe", String(yoe));
        files.forEach((f) => fd.append("files", f));
        const res = await axios.post("/api/skill-analyzer/image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResult(normalizeResult(res.data));
      } else if (mode === "upload" && files.length) {
        const fd = new FormData();
        fd.append("text", text);
        fd.append("targets", params.targets.join(","));
        fd.append("stack", params.stack.join(","));
        if (yoe) fd.append("yoe", String(yoe));
        files.forEach((f) => fd.append("files", f));
        const res = await axios.post("/api/skill-analyzer", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResult(normalizeResult(res.data));
      } else {
        const res = await axios.post("/api/skill-analyzer", {
          text,
          ...params,
        });
        setResult(normalizeResult(res.data));
      }
    } catch (e) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const saveSnapshot = async () => {
    if (saving) return;

    try {
      setSaving(true);
      const res = await axios.post("/api/skill-analyzer/save", {
        inputMeta: { mode, targets, yoe, stack },
        result,
      });

      if (res.data?.ok) {
        toast.success(res.data.message || "Analysis saved successfully!");

        // Download PDF if available
        if (res.data.pdfData) {
          const { base64, filename } = res.data.pdfData;

          // Create download link
          const link = document.createElement("a");
          link.href = base64;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success("PDF downloaded successfully!");
        }
      } else {
        toast.info(res.data?.note || "Save completed");
      }
    } catch (e) {
      console.error("Save error:", e);
      if (e.response?.data?.error === "Auth required") {
        toast.error("Please sign in to save analysis");
      } else {
        toast.error("Save failed. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Information Section */}
      <Card className="bg-white/95 dark:bg-neutral-900/60 backdrop-blur-md shadow-2xl hover:shadow-3xl border border-gray-100/60 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-1 relative">
        {/* Subtle background pattern */}
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2306b6d4" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-60 dark:opacity-10'></div>

        <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="p-4 bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-500/20 dark:via-green-500/20 dark:to-teal-500/20 rounded-3xl shadow-lg border border-green-200/50 dark:border-green-400/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10"></div>
              <TrendingUp className="h-8 w-8 text-emerald-700 dark:text-emerald-300 relative z-10" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent tracking-tight mb-2">
                Skill Analyzer
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium max-w-2xl">
                Paste your resume, upload PDF/DOCX or images. Get skills, gaps,
                and a personalized learning plan.
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-3"></div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div
            className="flex gap-2 p-2 bg-gray-100/80 dark:bg-white/5 backdrop-blur-sm rounded-2xl shadow-inner"
            role="tablist"
            aria-label="Input mode"
          >
            <Button
              variant={mode === "text" ? "default" : "ghost"}
              onClick={() => setMode("text")}
              className={`rounded-xl text-sm font-semibold flex-1 transition-all duration-300 ${
                mode === "text"
                  ? "bg-white dark:bg-white/10 shadow-lg shadow-blue-200/50 text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-white/10 transform scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              📝 Paste Text
            </Button>
            <Button
              variant={mode === "upload" ? "default" : "ghost"}
              onClick={() => setMode("upload")}
              className={`rounded-xl text-sm font-semibold flex-1 transition-all duration-300 ${
                mode === "upload"
                  ? "bg-white dark:bg-white/10 shadow-lg shadow-blue-200/50 text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-white/10 transform scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              📄 Upload PDF/DOCX
            </Button>
            <Button
              variant={mode === "image" ? "default" : "ghost"}
              onClick={() => setMode("image")}
              className={`rounded-xl text-sm font-semibold flex-1 transition-all duration-300 ${
                mode === "image"
                  ? "bg-white dark:bg-white/10 shadow-lg shadow-blue-200/50 text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-white/10 transform scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              🖼️ Upload Image
            </Button>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              aria-label="Resume text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="📋 Paste your resume or profile text here... We'll analyze your skills and suggest improvements!"
              className="w-full h-44 p-6 border-2 border-gray-200/80 dark:border-white/10 rounded-2xl shadow-lg bg-white/80 dark:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200/60 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-400 text-sm resize-none transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-white/20 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
              {text.length}/5000
            </div>
          </div>

          {/* File Upload */}
          {(mode === "upload" || mode === "image") && (
            <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl p-8 text-center bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-white/0 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-500/5 dark:hover:to-indigo-500/5 hover:border-blue-300 dark:hover:border-blue-400/40 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">
                    {mode === "image" ? "🖼️" : "📄"}
                  </span>
                </div>
                <input
                  aria-label="File uploader"
                  type="file"
                  multiple
                  onChange={onFileChange}
                  accept={mode === "image" ? ".jpg,.jpeg,.png" : ".pdf,.docx"}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {mode === "image"
                  ? "Drop images here or click to browse"
                  : "Drop PDF/DOCX files here or click to browse"}
              </p>

              {files.length > 0 && (
                <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-2 relative z-10">
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    📁 Selected Files:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-white dark:bg-white/10 rounded-xl shadow-md text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-white/10 text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                      >
                        <span>{mode === "image" ? "🖼️" : "📄"}</span>
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inputs (Targets, YOE, Stack) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Input
                aria-label="Target roles"
                placeholder="🎯 Target roles (comma separated)"
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
                className="rounded-2xl border-2 border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-sm focus:ring-4 focus:ring-blue-200/60 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 h-12 px-4"
              />
            </div>

            <div className="relative">
              <select
                aria-label="Years of experience"
                value={yoe}
                onChange={(e) => setYoe(e.target.value)}
                className="w-full border-2 border-gray-200/80 dark:border-white/10 rounded-2xl p-3 text-sm shadow-md bg-white/80 dark:bg-white/10 text-foreground backdrop-blur-sm focus:ring-4 focus:ring-blue-200/60 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 h-12 appearance-none cursor-pointer"
              >
                <option value="">⏱️ Years of experience</option>
                <option value="0-1">0-1 years</option>
                <option value="2-4">2-4 years</option>
                <option value="5-8">5-8 years</option>
                <option value="9+">9+ years</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <Input
                aria-label="Tech stack"
                placeholder="⚡ Tech stack (comma separated)"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="rounded-2xl border-2 border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-white/10 backdrop-blur-sm focus:ring-4 focus:ring-blue-200/60 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-400 transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:hover:border-white/20 h-12 px-4"
              />
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              aria-label="Resume text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="📋 Paste your resume or profile text here... We'll analyze your skills and suggest improvements!"
              className="w-full h-44 p-6 border-2 border-gray-200/80 dark:border-white/10 rounded-2xl shadow-lg bg-white/80 dark:bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200/60 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-400 text-sm resize-none transition-all duration-300 hover:shadow-xl hover:border-gray-300 dark:hover:border-white/20 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
              {text.length}/5000
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Button
              onClick={analyze}
              disabled={loading}
              className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 font-semibold text-base relative overflow-hidden ${
                loading
                  ? "bg-gradient-to-r from-gray-400 to-gray-500"
                  : "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>🔍 Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Analyze Skills</span>
                  </>
                )}
              </div>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </Button>

            {user ? (
              <Button
                variant="outline"
                onClick={saveSnapshot}
                disabled={!result || saving}
                className={`rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 px-6 py-3 font-semibold relative overflow-hidden ${
                  result && !saving
                    ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 shadow-lg hover:shadow-xl"
                    : "border-gray-200 text-gray-400 bg-gray-50 dark:border-gray-500 dark:text-gray-500 dark:bg-gray-700"
                }`}
                title="Save analysis to database and download as PDF"
              >
                <div className="flex items-center gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <span>📄 Save & Download PDF</span>
                  )}
                </div>
              </Button>
            ) : (
              <div
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-xl"
                aria-live="polite"
              >
                <span className="text-lg">🔒</span>
                <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  Sign in to save snapshots
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Section - Only shown after analysis */}
      {result && (
        <Card
          ref={resultRef}
          className="bg-white/90 dark:bg-white/5 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden transition-all hover:shadow-3xl scroll-mt-24"
        >
          <CardContent className="p-6 md:p-10">
            <ResultPanel data={result} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultPanel({ data }) {
  const subs = [
    { label: "Core Tech", key: "Core Tech" },
    { label: "Frameworks", key: "Frameworks" },
    { label: "CS Fundamentals", key: "CS Fundamentals" },
    { label: "Tooling", key: "Tooling" },
    { label: "Soft Skills", key: "Soft Skills" },
  ];
  const prof = data?.proficiency || {};
  const overall = Math.round(
    Object.values(prof).reduce((a, v) => a + (v?.score || 0), 0) /
      Math.max(1, Object.keys(prof).length)
  );

  return (
    <div className="space-y-8">
      {/* Top Row - Overall Score and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Skill Score */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Overall Skill Score
          </div>
          <ScoreDonut value={overall} />
        </div>

        {/* Summary */}
        {data?.summary && (
          <Card className="p-5 shadow-md rounded-2xl lg:col-span-2">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Summary
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {data.summary}
            </p>
          </Card>
        )}
      </div>

      {/* Second Row - Role Fit and Skill Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Fit */}
        {data?.roleFit && (
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Role Fit
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.roleFit).map(([role, info], i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/30"
                >
                  {role}: {info.match}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Skill Categories */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-3">
          {subs.map((s, i) => (
            <div
              key={i}
              className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.label}</div>
              <Progress
                value={averageForCategory(data, s.key)}
                className="h-2 mt-2 rounded-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Third Row - Proficiency and Extracted Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proficiency */}
        {prof && (
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
              Proficiency
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(prof).map(([skill, v], i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium">
                    <span>{skill}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {v.score}% · {v.band}
                    </span>
                  </div>
                  <Progress value={v.score} className="h-2 mt-1 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Extracted Skills */}
        {Array.isArray(data?.extractedSkills) && (
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Extracted Skills
            </div>
            <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
              {data.extractedSkills.map((s, i) => (
                <li key={i} className="leading-snug">
                  <span className="font-semibold">{s.name}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">({s.category})</span> —{" "}
                  <span className="text-gray-700 dark:text-gray-300">{s.evidence}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Fourth Row - Skill Gaps and Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gaps */}
        {Array.isArray(data?.skillGaps) && (
          <Card className="p-5 shadow-md rounded-2xl">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Skill Gaps
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 max-h-80 overflow-y-auto">
              {data.skillGaps.map((g, i) => (
                <li key={i}>
                  <span className="font-semibold">{g.skill}:</span> {g.why} —{" "}
                  <span className="text-blue-700 dark:text-blue-300">{g.how}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Learning Path */}
        {Array.isArray(data?.learningPath) && (
          <Card className="shadow-md rounded-2xl">
            <div className="px-4 pt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Learning Path
            </div>
            <Accordion
              type="single"
              collapsible
              className="px-2 max-h-80 overflow-y-auto"
            >
              {data.learningPath.map((lp, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-sm font-semibold">
                    {lp.skill}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {lp.chapters?.map((c, j) => (
                        <div
                          key={j}
                          className="border rounded-xl p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 transition-all"
                        >
                          <div className="flex justify-between text-sm font-semibold">
                            <span>{c.title}</span>
                            <span className="text-gray-500 dark:text-gray-400">{c.hours}h</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {(c.topics || []).join(", ")}
                          </div>
                          {c.youtubeQueries?.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                              YT:{" "}
                              {(c.youtubeQueries || []).slice(0, 3).join(" · ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}
      </div>
    </div>
  );
}

function averageForCategory(data, category) {
  const items = (data?.extractedSkills || []).filter(
    (s) => s.category === category
  );
  if (items.length === 0) return 0;
  const prof = data?.proficiency || {};
  let sum = 0;
  let n = 0;
  items.forEach((s) => {
    const p = (prof?.[s.name] && prof?.[s.name].score) ?? 0;
    sum += p;
    n += 1;
  });
  return sum / Math.max(1, n);
}

function normalizeResult(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = { ...raw };
  if (!Array.isArray(out.extractedSkills)) out.extractedSkills = [];
  if (!out.proficiency || typeof out.proficiency !== "object")
    out.proficiency = {};
  if (!Array.isArray(out.skillGaps)) out.skillGaps = [];
  if (!out.roleFit || typeof out.roleFit !== "object") out.roleFit = {};
  if (!Array.isArray(out.learningPath)) out.learningPath = [];
  out.summary = out.summary || "";
  return out;
}
