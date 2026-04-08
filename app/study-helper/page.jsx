"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../@/components/ui/input.jsx";
import { Sparkles, Send, Loader2, Plus, MessageSquare, Menu, LayoutDashboard, Copy, Volume2, VolumeX, Edit, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import LoadingSpinner from "../../components/ui/loading";

const VoyagerLogo = ({ isLoading, className }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      videoRef.current?.play().catch(e => console.log("Video auto-play blocked:", e));
    } else {
      videoRef.current?.pause();
    }
  }, [isLoading]);

  const handleMouseEnter = () => {
    if (!isLoading) {
      videoRef.current?.play().catch(e => console.log("Video play on hover blocked:", e));
    }
  };

  const handleMouseLeave = () => {
    if (!isLoading) {
      videoRef.current?.pause();
    }
  };

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm transition-all duration-500 ${isLoading ? "ring-2 ring-[#bcf540]/60 shadow-[0_0_20px_rgba(188,245,64,0.3)] scale-105" : "border border-black/5"} ${className}`}
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
        style={{ pointerEvents: 'none', filter: 'brightness(1.1) contrast(1.1)' }}
      />
    </div>
  );
};

export default function StudyHelperAI() {
  const { user } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    const saved = localStorage.getItem("voyager_study_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        } else {
          createNewChat();
        }
      } catch (e) {
        createNewChat();
      }
    } else {
      const migrate = localStorage.getItem("voyager_history");
      if (migrate) {
        try {
          const parsedData = JSON.parse(migrate);
          const careerChats = parsedData.filter(s => s.model === "career" || !s.model);
          if (careerChats.length > 0) {
            setSessions(careerChats);
            setActiveSessionId(careerChats[0].id);
          } else {
            createNewChat();
          }
        } catch (e) {
          createNewChat();
        }
      } else {
        createNewChat();
      }
    }
  }, [isInitializing]);

  const createNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      messages: [{
        id: 1,
        type: "bot",
        content: "Welcome to Voyager Study Helper. How can I assist you with your learning today?",
        timestamp: new Date().toISOString()
      }]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("voyager_study_history", JSON.stringify(sessions));
    }
  }, [sessions]);

  const updateSession = (updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return updater(s);
      }
      return s;
    }));
  };

  const setMessages = (updaterFn) => {
    updateSession(s => {
      const newMessages = typeof updaterFn === 'function' ? updaterFn(s.messages) : updaterFn;
      let title = s.title;
      if (title === "New Chat" && newMessages.length > 1) {
        const userMsg = newMessages.find(m => m.type === "user");
        if (userMsg) {
          title = userMsg.content.substring(0, 30) + "...";
        }
      }
      return { ...s, title, messages: newMessages };
    });
  };

  const currentSession = sessions.find(s => s.id === activeSessionId);
  const messages = currentSession ? currentSession.messages : [];

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
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const result = await axios.post("/api/ai-career-advisor", {
        message: inputMessage,
      });

      if (result.data.success) {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          type: "bot",
          content: result.data.response,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        toast.error("Failed to get response. Please try again.");
      }
    } catch (error) {
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
        toast.error("Failed to enhance question.");
      }
    } catch (error) {
      toast.error("Failed to enhance question.");
    } finally {
      setEnhancingMessage(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Text copied to clipboard!");
  };

  const handleTTS = async (text, msgId) => {
    if (playingAudioId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgId);
      toast.success("Generating audio...", { id: "tts_status" });
      const res = await axios.post('/api/text-to-speech', { input: text });
      if (res.data.success && res.data.audio) {
        toast.success("Audio playing...", { id: "tts_status" });
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(res.data.audio);
        audioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.play();
      } else {
        toast.error("Failed to generate audio", { id: "tts_status" });
        setPlayingAudioId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error generating audio", { id: "tts_status" });
      setPlayingAudioId(null);
    }
  };

  const isEmptyChat = messages.length <= 1;

  if (isInitializing) {
    return <div className="h-screen bg-[#f8faf6] flex items-center justify-center"><LoadingSpinner message="Initializing Study Helper..." /></div>;
  }

  const renderInputFormBox = () => (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 relative">
      <div className="relative flex items-center w-full bg-white shadow-[0_4px_24px_rgba(25,28,26,0.06)] rounded-[2rem] p-2 transition-all border border-black/5 text-[15px] focus-within:shadow-[0_0_15px_rgba(188,245,64,0.3)] focus-within:ring-1 focus-within:ring-[#bcf540]/50">
        <div className="p-2 ml-2 rounded-full hover:bg-[#eceeea] cursor-pointer text-[#4e6354] group transition-colors">
            <Plus className="w-5 h-5 group-hover:text-[#293d2f]" />
        </div>
        <Input
          placeholder="Ask anything..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none px-4 h-12 text-[15px] font-medium placeholder:text-[#434842] text-[#191c1a]"
          disabled={isLoading}
        />

        <div className="flex items-center gap-1.5 shrink-0 pr-2">
          <button
            onClick={enhanceMessage}
            disabled={!inputMessage.trim() || enhancingMessage || isLoading}
            className="p-2 rounded-full hover:bg-[#eceeea] transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#4e6354] hover:text-[#293d2f]"
            title="Enhance question with AI"
          >
            {enhancingMessage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 hover:text-[#bcf540] transition-colors" />
            )}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${!inputMessage.trim() ? "bg-[#eceeea] text-[#434842] cursor-not-allowed" : "bg-[#4e6354] text-white hover:bg-[#293d2f]"}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white/70" />
            ) : (
              <Send className="h-4 w-4 -ml-[1px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#f8faf6] font-sans text-[#191c1a] overflow-hidden">

      {/* Styled Sidebar (Ethereal Grove) */}
      <div className={`${isSidebarOpen ? 'w-64 border-r border-[#e1e3df]' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden bg-[#eceeea] flex flex-col z-20 h-full relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div className="p-4 flex items-center justify-between">
            <Link href="/workspace/ai-tools" className="flex items-center py-2 px-3 hover:bg-[#e7e9e5] rounded-[1rem] transition-colors group cursor-pointer w-full text-[15px] font-bold text-[#191c1a]">
                <span className="truncate">Study Helper</span>
                <Edit className="ml-auto w-4 h-4 text-[#4e6354] group-hover:text-[#293d2f]" onClick={(e) => { e.preventDefault(); createNewChat(); }} />
            </Link>
        </div>

        <div className="px-4 pb-4 flex flex-col gap-1.5">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[#191c1a] hover:bg-[#e7e9e5] transition-colors rounded-[1rem]">
                <Edit className="w-4 h-4 text-[#4e6354]" />
                New chat
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[#191c1a] hover:bg-[#e7e9e5] transition-colors rounded-[1rem]">
                <Search className="w-4 h-4 text-[#4e6354]" />
                Search chats
            </button>
            <Link href="/workspace/ai-tools">
              <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-[#191c1a] hover:bg-[#e7e9e5] transition-colors rounded-[1rem]">
                  <LayoutDashboard className="w-4 h-4 text-[#4e6354]" />
                  Back to Tools
              </button>
            </Link>
        </div>

        <div className="mt-2 px-6 py-2 text-[11px] font-extrabold uppercase tracking-widest text-[#4e6354]">Recents</div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 hide-scrollbar">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => { setActiveSessionId(session.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-[1rem] transition-colors text-sm font-medium truncate ${activeSessionId === session.id ? 'bg-[#ffffff] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#191c1a]' : 'text-[#434842] hover:bg-[#e7e9e5] text-[#191c1a]'}`}
            >
              {session.title || "New Chat"}
            </button>
          ))}
        </div>

        <div className="p-3 mt-auto flex items-center gap-3 cursor-pointer hover:bg-[#e7e9e5] rounded-[1rem] transition-colors m-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#bcf540] to-[#4e6354] flex items-center justify-center text-xs font-bold text-[#191c1a] shadow-inner border border-black/10">
                {user?.fullName ? user.fullName.charAt(0) : "V"}
            </div>
            <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#191c1a]">{user?.fullName || "Voyager"}</span>
                <span className="text-[11px] text-[#4e6354] font-medium tracking-wide">STUDENT PRO</span>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#f8faf6] relative overflow-hidden">
        
        {/* Toggle Sidebar Button & Header */}
        <div className="p-4 absolute top-0 left-0 z-20">
          {!isSidebarOpen && (
            <Button onClick={() => setIsSidebarOpen(true)} variant="ghost" size="icon" className="text-[#4e6354] hover:text-[#191c1a] rounded-[1rem] hover:bg-white shadow-sm bg-white/50 backdrop-blur-md border border-black/5">
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {isEmptyChat ? (
            <div className="flex-1 flex flex-col items-center justify-center -mt-16 px-4 w-full h-full z-10">
                <h2 className="text-[2rem] font-bold mb-10 text-[#191c1a] tracking-tight text-center">How can I help you learn today?</h2>
                {renderInputFormBox()}
                <div className="flex gap-3 justify-center mt-8 flex-wrap">
                    <button onClick={() => setInputMessage("Explain quantum computing simply.")} className="px-5 py-2.5 text-[13px] font-semibold bg-white text-[#4e6354] border border-[#d1d5cf] shadow-sm rounded-full hover:bg-[#f2f4f0] transition-colors">Explain a Concept</button>
                    <button onClick={() => setInputMessage("Can you quiz me on US History?")} className="px-5 py-2.5 text-[13px] font-semibold bg-white text-[#4e6354] border border-[#d1d5cf] shadow-sm rounded-full hover:bg-[#f2f4f0] transition-colors">Quiz Me</button>
                    <button onClick={() => setInputMessage("Help me summarize this article.")} className="px-5 py-2.5 text-[13px] font-semibold bg-white text-[#4e6354] border border-[#d1d5cf] shadow-sm rounded-full hover:bg-[#f2f4f0] transition-colors">Summarization</button>
                    <button onClick={() => setInputMessage("Let's brainstorm project ideas.")} className="px-5 py-2.5 text-[13px] font-semibold bg-[#bcf540] text-[#191c1a] border border-[#a1d92d] shadow-sm rounded-full hover:bg-[#aade2d] transition-colors">Brainstorm</button>
                </div>
            </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-16 pb-36 hide-scrollbar">
              <div className="max-w-3xl mx-auto flex flex-col space-y-8">
                {messages.map((message) => {
                  if (message.id === 1 && messages.length === 1) return null; // skip initial bot message
                  const isUser = message.type === "user";
                  return (
                    <div key={message.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {isUser ? (
                            <div className="bg-[#4e6354] text-white px-6 py-4 rounded-[2rem] max-w-[85%] md:max-w-[80%] font-medium text-[15px] leading-relaxed break-words shadow-[0_4px_24px_rgba(78,99,84,0.15)]">
                                <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                            </div>
                        ) : (
                            <div className="flex items-start gap-5 w-full group">
                                <VoyagerLogo isLoading={false} className="w-10 h-10 flex-shrink-0 mt-1" />
                                <div className="flex-1 flex flex-col min-w-0 bg-white border border-black/5 px-6 py-5 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                                    <div className="text-[15px] text-[#191c1a] font-medium leading-relaxed prose prose-sm prose-p:text-[#191c1a] prose-headings:text-[#191c1a] prose-a:text-[#4e6354] max-w-none">
                                        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleCopy(message.content)} className="p-2 rounded-[1rem] bg-[#f8faf6] hover:bg-[#eceeea] text-[#4e6354] hover:text-[#293d2f] transition-all border border-transparent hover:border-black/5" title="Copy text">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleTTS(message.content, message.id)} className="p-2 rounded-[1rem] bg-[#f8faf6] hover:bg-[#eceeea] text-[#4e6354] hover:text-[#293d2f] transition-all border border-transparent hover:border-black/5" title={playingAudioId === message.id ? "Stop audio" : "Play audio"}>
                                            {playingAudioId === message.id ? <VolumeX className="w-4 h-4 text-[#bcf540]" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex w-full justify-start animate-in fade-in duration-300">
                    <div className="flex items-center gap-5">
                      <VoyagerLogo isLoading={true} className="w-10 h-10 flex-shrink-0 mt-0" />
                      <div className="mt-0 flex items-center gap-1.5 px-4 py-4 bg-white border border-black/5 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <div className="w-2.5 h-2.5 bg-[#4e6354] rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-[#4e6354] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                        <div className="w-2.5 h-2.5 bg-[#4e6354] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#f8faf6] via-[#f8faf6] to-transparent pt-24 z-20 flex flex-col items-center">
                {renderInputFormBox()}
                <p className="text-[12px] font-medium text-[#434842] mt-4 text-center tracking-wide">
                  Study Helper can make mistakes. AI knowledge powered by Ethereal Grove Labs.
                </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
