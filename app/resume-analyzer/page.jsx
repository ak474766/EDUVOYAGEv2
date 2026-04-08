"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../@/components/ui/input";
import { FileText, LayoutDashboard, Loader2, Paperclip, CheckCircle2, Target, AlertTriangle, Zap, Compass, Sparkles, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

const formatSkillAnalysisToHtml = (data) => {
  return (
    <div className="font-sans space-y-8 text-[#191c1a] dark:text-[#e1e3df] max-w-4xl mx-auto w-full">
      {data.summary && (
        <div className="bg-[#bcf540]/10 border border-[#bcf540]/30 rounded-3xl p-6 mb-8 mt-4">
            <div className="flex items-start gap-4">
               <Sparkles className="h-8 w-8 text-[#bcf540] shrink-0 mt-1" />
               <p className="text-base font-medium leading-relaxed">{data.summary}</p>
            </div>
        </div>
      )}

      {data.roleFit && Object.keys(data.roleFit).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
            <Target className="h-5 w-5" /> Role Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {Object.entries(data.roleFit).map(([role, fit], idx) => (
               <div key={idx} className="bg-white dark:bg-[#1a231d] rounded-3xl p-5 border border-[#e1e3df] dark:border-white/5 relative overflow-hidden shadow-sm">
                 <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#bcf540]/50 to-[#bcf540]" style={{width: `${fit.match}%`}}></div>
                 <div className="flex justify-between items-center mb-3 mt-1">
                    <h4 className="font-bold text-base">{role}</h4>
                    <span className="text-sm font-black bg-[#e7eee8] dark:bg-[#1f2b23] text-[#4e6354] dark:text-[#bcf540] px-3 py-1.5 rounded-lg">{fit.match}% Match</span>
                 </div>
                 <p className="text-sm text-ev-on-surface-variant font-medium leading-relaxed">{fit.rationale}</p>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mt-8">
          {data.skillGaps && data.skillGaps.length > 0 && (
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Critical Skill Gaps
              </h3>
              <div className="space-y-4">
                 {data.skillGaps.map((gap, idx) => (
                    <div key={idx} className="bg-[#f8faf6] dark:bg-[#151c17] rounded-3xl p-5 border border-[#e1e3df] dark:border-white/5 border-l-4 border-l-[#ff5b5b] shadow-sm">
                       <h4 className="font-bold text-base mb-2">{gap.skill}</h4>
                       <p className="text-sm text-ev-on-surface-variant mb-3 leading-relaxed"><strong>Why it matters:</strong> {gap.why}</p>
                       <div className="bg-white dark:bg-[#1f2b23] p-3 rounded-xl border border-[#e1e3df] dark:border-white/5">
                           <p className="text-xs text-[#4e6354] dark:text-[#bcf540] font-bold flex items-start gap-1.5 leading-relaxed">
                              <Zap className="h-4 w-4 shrink-0" /> {gap.how}
                           </p>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {data.learningPath && data.learningPath.length > 0 && (
            <div className="space-y-4 flex-1">
               <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#4e6354] dark:text-[#bcf540] flex items-center gap-2">
                <Compass className="h-5 w-5" /> Recommended Learning Path
              </h3>
              <div className="space-y-4">
                 {data.learningPath.map((path, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#1a231d] rounded-3xl p-5 border border-[#e1e3df] dark:border-white/5 shadow-sm">
                       <h4 className="font-bold text-base mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#bcf540]"/> Focus: {path.skill}</h4>
                       <div className="space-y-3">
                          {path.chapters?.map((ch, cidx) => (
                              <div key={cidx} className="bg-[#f8faf6] dark:bg-[#111613] p-4 rounded-2xl border border-[#e1e3df] dark:border-white/5 flex flex-col gap-2">
                                 <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold">{ch.title}</span>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-ev-on-surface-variant bg-ev-surface-container-high px-2.5 py-1 rounded-md">{ch.hours} hrs</span>
                                 </div>
                                 <p className="text-xs font-medium text-ev-on-surface-variant leading-relaxed">{ch.topics?.join(" • ")}</p>
                              </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default function ResumeAnalyzer() {
  const [mcqStep, setMcqStep] = useState(1);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResumeText, setExtractedResumeText] = useState("");
  
  const [resumeTargets, setResumeTargets] = useState("Frontend Developer");
  const [resumeYoe, setResumeYoe] = useState("0-1");
  const [primaryGoal, setPrimaryGoal] = useState("Job Search");
  const [learningStyle, setLearningStyle] = useState("Project-based");

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

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
        
        if (res.data.success && res.data.text && res.data.text.trim().length > 10) {
          setExtractedResumeText(res.data.text);
          setMcqStep(2); 
        } else {
          toast.error("Could not read enough text from the resume. Please try a different file.");
          setResumeFiles([]); 
        }
      } catch (error) {
        toast.error("Failed to read resume. Please ensure it's a valid PDF/DOCX/TXT.");
        setResumeFiles([]); 
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

    setMcqStep(3); // Result step
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await axios.post("/api/skill-analyzer", {
        text: extractedResumeText,
        targets: resumeTargets.split(",").map(t => t.trim()).filter(Boolean),
        stack: [learningStyle],
        yoe: resumeYoe
      });
      
      if (res.data) {
        setAnalysisResult(res.data);
      }
    } catch (e) {
      toast.error("Analysis failed. Please try again.");
      setMcqStep(1); // Go back if failed completely
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalyzer = () => {
      setMcqStep(1);
      setResumeFiles([]);
      setExtractedResumeText("");
      setAnalysisResult(null);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] w-full font-sans text-ev-on-surface bg-ev-surface container mx-auto px-4 md:px-8 overflow-y-auto pt-8 pb-16">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between max-w-4xl mx-auto w-full">
         <div>
            <Link href="/workspace/ai-tools" className="text-sm font-bold text-ev-on-surface-variant hover:text-ev-primary mb-4 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4"/> Back to Hub
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191c1a] dark:text-[#f8faf6] flex items-center gap-3 mt-4">
              <FileText className="w-8 h-8 text-[#bcf540]" /> Resume Analyzer
            </h1>
         </div>
         {mcqStep === 3 && (
            <Button onClick={resetAnalyzer} variant="outline" className="rounded-full border-ev-outline-variant/30 font-bold hidden sm:flex">
                Analyze Another
            </Button>
         )}
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto">
        {mcqStep === 1 || mcqStep === 2 ? (
            <div className="bg-white dark:bg-[#1a231d] rounded-[2.5rem] border border-[#e1e3df] dark:border-white/5 shadow-sm p-8 md:p-12 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-ev-primary/20 via-ev-tertiary to-ev-primary/20"></div>
                
                <div className="mx-auto w-20 h-20 bg-[#e7eee8] dark:bg-[#1f2b23] rounded-full flex items-center justify-center mb-6 shadow-inner">
                    {mcqStep === 1 ? <FileText className="w-10 h-10 text-[#4e6354] dark:text-[#bcf540]" /> : <LayoutDashboard className="w-10 h-10 text-[#4e6354] dark:text-[#bcf540]" />}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-center text-ev-on-surface mb-3">
                    {mcqStep === 1 ? "Upload your Resume" : "Configure Analysis Goals"}
                </h2>
                <p className="text-center font-medium text-ev-on-surface-variant max-w-lg mx-auto mb-10 text-base">
                {mcqStep === 1 ? "Provide your document to begin the deep-dive analysis." : "Help Voyager understand what you're optimizing for."}
                </p>

                <div className="grid gap-8 max-w-2xl mx-auto">
                {mcqStep === 1 ? (
                    <div className="border-2 border-dashed border-ev-outline-variant/50 rounded-3xl p-12 text-center hover:bg-ev-surface-container/50 transition-colors cursor-pointer relative overflow-hidden group bg-[#f8faf6] dark:bg-[#111613]">
                        <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isExtracting}
                        accept=".pdf,.docx,.txt"
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 ${isExtracting ? 'hidden' : ''}`}
                        />
                        <div className="mb-6 w-16 h-16 rounded-full bg-ev-primary/10 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                            {isExtracting ? <Loader2 className="h-8 w-8 text-ev-primary animate-spin" /> : <Paperclip className="h-8 w-8 text-[#bcf540]" />}
                        </div>
                        <p className="text-xl font-bold text-ev-on-surface">
                            {isExtracting ? "Extracting intelligence..." : (resumeFiles.length > 0 ? resumeFiles[0].name : "Click or drag resume here (PDF/DOCX/TXT)")}
                        </p>
                        <p className="text-sm text-ev-on-surface-variant mt-3 font-medium">Max file size 10MB.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                        {/* Question 1 */}
                        <div>
                            <p className="text-base font-bold text-ev-on-surface mb-3">What is your primary goal?</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Job Search", "Level Up Skills", "Career Switch", "Freelance"].map(opt => (
                                <button 
                                    key={opt}
                                    onClick={() => setPrimaryGoal(opt)}
                                    className={`p-4 rounded-2xl border text-sm font-bold transition-all ${
                                        primaryGoal === opt ? "bg-[#bcf540]/10 border-[#bcf540] text-[#4e6354] dark:text-[#bcf540] shadow-sm transform -translate-y-1" : "border-ev-outline-variant/30 hover:border-ev-primary/50 text-ev-on-surface-variant bg-[#f8faf6] dark:bg-[#111613]"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                            </div>
                        </div>
                        
                        {/* Question 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-base font-bold text-ev-on-surface mb-3">Years of Experience</p>
                                <div className="grid grid-cols-4 gap-2">
                                {["0-1", "2-4", "5-8", "9+"].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setResumeYoe(opt)}
                                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                                            resumeYoe === opt ? "bg-[#bcf540]/10 border-[#bcf540] text-[#4e6354] dark:text-[#bcf540] shadow-sm" : "border-ev-outline-variant/30 hover:border-ev-primary/50 text-ev-on-surface-variant bg-[#f8faf6] dark:bg-[#111613]"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                                </div>
                            </div>

                            {/* Target Roles */}
                            <div>
                                <p className="text-base font-bold text-ev-on-surface mb-3">Target Roles</p>
                                <Input 
                                    value={resumeTargets}
                                    onChange={e => setResumeTargets(e.target.value)}
                                    placeholder="e.g. Frontend, Fullstack..."
                                    className="bg-[#f8faf6] dark:bg-[#111613] border-ev-outline-variant/30 focus-visible:ring-ev-primary/30 h-[46px] rounded-xl font-medium px-4 text-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-6 flex gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => setMcqStep(1)}
                                className="flex-1 rounded-full border-ev-outline-variant/30 h-14 font-bold text-base"
                            >
                                Back
                            </Button>
                            <Button 
                                onClick={handleResumeSubmit}
                                disabled={isLoading}
                                className="flex-[2] rounded-full bg-ev-primary hover:bg-[#bcf540] hover:text-[#191c1a] text-white h-14 font-extrabold text-base shadow-md disabled:opacity-50 transition-all duration-300"
                            >
                                Generate Analysis <Sparkles className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        ) : (
             <div className="w-full flex-1">
                 {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-[#bcf540]/30 rounded-full animate-ping absolute top-0 left-0"></div>
                            <div className="w-20 h-20 bg-ev-primary rounded-full flex items-center justify-center relative z-10 shadow-lg">
                               <Sparkles className="w-10 h-10 text-[#bcf540] animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-ev-on-surface mt-4">Voyager is analyzing your capability...</h2>
                        <p className="text-ev-on-surface-variant font-medium">This usually takes about 10 seconds.</p>
                     </div>
                 ) : (
                     <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-16">
                         {analysisResult && formatSkillAnalysisToHtml(analysisResult)}
                     </div>
                 )}
             </div>
        )}
      </div>

      <div className="text-center mt-auto pt-8">
         <p className="text-xs font-medium text-ev-on-surface-variant/80">
             Powered by Ethereal Grove Labs. Analysis may contain inaccuracies.
         </p>
      </div>
    </div>
  );
}
