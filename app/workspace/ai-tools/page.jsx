"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, GraduationCap, MessageSquare, Sparkles, ArrowRight } from "lucide-react";
import LoadingSpinner from "../../../components/ui/loading";

function AIToolsHub() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Initializing Voyager AI..." />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full font-sans text-ev-on-surface bg-ev-surface container mx-auto px-4 md:px-8 overflow-y-auto pt-8">
      
      {/* Header Area */}
      <div className="mb-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#191c1a] dark:text-[#f8faf6]">
          Voyager AI <Sparkles className="inline-block text-ev-primary w-8 h-8 ml-2 -mt-2" />
        </h1>
        <p className="text-lg md:text-xl font-medium text-ev-on-surface-variant max-w-2xl leading-relaxed">
          Select an AI module to assist you. Choose exactly what you need to advance your career and knowledge.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl pb-16">
        
        {/* Study Helper AI / Chat */}
        <Link href="/study-helper" className="group">
          <div className="h-full relative overflow-hidden bg-white dark:bg-[#1a231d] rounded-[2rem] p-8 border border-[#e1e3df] dark:border-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-5px_rgba(188,245,64,0.15)] group-hover:border-ev-tertiary">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ev-tertiary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-16 h-16 bg-[#e7eee8] dark:bg-[#1f2b23] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#bcf540]/20 transition-colors">
              <MessageSquare className="w-8 h-8 text-ev-primary dark:text-[#bcf540]" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-[#191c1a] dark:text-[#f8faf6]">Study Helper AI</h2>
            <p className="text-ev-on-surface-variant font-medium leading-relaxed mb-8">
              Discuss learning strategies, career questions, and clear up your doubts in an immersive chatting experience.
            </p>
            
            <div className="absolute bottom-8 right-8 flex items-center text-sm font-bold text-ev-primary dark:text-[#bcf540] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              Open <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* AI Tutor */}
        <Link href="/ai-tutor" className="group">
          <div className="h-full relative overflow-hidden bg-white dark:bg-[#1a231d] rounded-[2rem] p-8 border border-[#e1e3df] dark:border-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-5px_rgba(188,245,64,0.15)] group-hover:border-ev-tertiary">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ev-tertiary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-16 h-16 bg-[#e7eee8] dark:bg-[#1f2b23] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#bcf540]/20 transition-colors">
              <GraduationCap className="w-8 h-8 text-ev-primary dark:text-[#bcf540]" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-[#191c1a] dark:text-[#f8faf6]">AI Tutor</h2>
            <div className="inline-block mt-[-6px] mb-3 bg-[#bcf540]/20 text-[#4e6354] dark:text-[#bcf540] text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md">Live Voice Audio</div>
            <p className="text-ev-on-surface-variant font-medium leading-relaxed mb-8">
              Talk directly with Voyager over voice. Experience real-time audio interaction with our smartest models.
            </p>

            <div className="absolute bottom-8 right-8 flex items-center text-sm font-bold text-ev-primary dark:text-[#bcf540] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              Connect <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
        
        {/* Resume Analyzer */}
        <Link href="/resume-analyzer" className="group">
          <div className="h-full relative overflow-hidden bg-white dark:bg-[#1a231d] rounded-[2rem] p-8 border border-[#e1e3df] dark:border-white/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-5px_rgba(188,245,64,0.15)] group-hover:border-ev-tertiary">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ev-tertiary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-16 h-16 bg-[#e7eee8] dark:bg-[#1f2b23] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#bcf540]/20 transition-colors">
              <FileText className="w-8 h-8 text-ev-primary dark:text-[#bcf540]" />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-[#191c1a] dark:text-[#f8faf6]">Resume Analyzer</h2>
            <p className="text-ev-on-surface-variant font-medium leading-relaxed mb-8">
              Upload your CV and get actionable feedback, skill gap analysis, and tailored learning paths.
            </p>

            <div className="absolute bottom-8 right-8 flex items-center text-sm font-bold text-ev-primary dark:text-[#bcf540] uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              Analyze <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default AIToolsHub;
