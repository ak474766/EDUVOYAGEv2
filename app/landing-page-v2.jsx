"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import {
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  Brain,
  BookOpen,
  GraduationCap,
  Briefcase,
  Sparkles,
  Award,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  Mail,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const navItems = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Outcomes", href: "#outcomes" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const steps = [
  "Define your learning goal",
  "Generate AI course layout",
  "Learn chapter-by-chapter",
  "Watch curated videos",
  "Complete smart quizzes",
  "Unlock certificate",
  "Get career and skill guidance",
];

const features = [
  {
    title: "AI Course Generation",
    text: "Turn vague goals into chapter-based learning plans.",
    icon: Sparkles,
    image: "/landingpage/feature-ai-course-generation.png",
  },
  {
    title: "Video Enrichment",
    text: "Relevant YouTube picks directly mapped to each chapter.",
    icon: CirclePlay,
    image: "/landingpage/feature-video-enrichment.png",
  },
  {
    title: "Enrollment + Progress",
    text: "Enroll once, continue where you left off, and track chapter completion.",
    icon: CheckCircle2,
    image: "/landingpage/skill-analyzer-panel.png",
  },
  {
    title: "Progress Tracking",
    text: "Track chapter completion and learning momentum in one place.",
    icon: BarChart3,
    image: "/landingpage/feature-progress-tracking.png",
  },
  {
    title: "Quiz + Certificate",
    text: "Validate retention and unlock printable certificates.",
    icon: Award,
    image: "/landingpage/feature-quiz-certificate.png",
  },

  {
    title: "Career + Skill Layer",
    text: "Map learning to role goals with advisor and gap analysis.",
    icon: Briefcase,
    image: "/landingpage/feature-content-generation.png",
  },
];

const whatItDoes = [
  "Custom AI Course Generation",
  "AI Course Content Generation",
  "YouTube Video Enrichment",
  "Enrollment and Chapter Progress",
  "Built-in Quiz Engine",
  "Certificate Issuance",
  "AI Career Advisor + Skill Analyzer",
  "Subscription-Aware Access",
];

const stats = [
  { value: 50000, suffix: "+", label: "Active Learners" },
  { value: 10000, suffix: "+", label: "Courses Generated" },
  { value: 95, suffix: "%", label: "Satisfaction" },
  { value: 25, suffix: "x", label: "Faster Learning" },
];

const testimonials = [
  {
    name: "Aarav Menon",
    role: "Software Student",
    text: "I stopped jumping between random tutorials. EduVoyage gave me one clear path and I finished it.",
    avatar: "/landingpage/testimonial-avatar-01.png",
  },
  {
    name: "Sara Khan",
    role: "Marketing Professional",
    text: "The quiz and certificate flow kept me disciplined. I finally have proof of learning outcomes.",
    avatar: "/landingpage/testimonial-avatar-02.png",
  },
  {
    name: "Vikram Nair",
    role: "Career Switcher",
    text: "Career advisor + skill analyzer helped me choose what to learn next with confidence.",
    avatar: "/landingpage/testimonial-avatar-03.png",
  },
];

const IMAGE_EXTENSIONS = [".mp4", ".png", ".jpeg", ".jpg", ".avif"];

function getImageCandidates(src) {
  if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(src)) {
    return [src];
  }
  return IMAGE_EXTENSIONS.map((ext) => `${src}${ext}`);
}

function VisualBlock({ src, alt, className, minHeight = 220 }) {
  const candidates = useMemo(() => getImageCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div
        className={`${className} rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a2f8f] via-[#2338ab] to-[#102362]`}
        style={{ minHeight }}
      />
    );
  }

  const currentSrc = candidates[candidateIndex];

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={{ minHeight }}
      loading="lazy"
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

export default function LandingPageV2() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const heroTitleRef = useRef(null);
  const heroVisualRef = useRef(null);
  const timelineRef = useRef(null);
  const timelineProgressRef = useRef(null);
  const counterRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: reduced ? 0 : 1.1,
      smoothWheel: !reduced,
      wheelMultiplier: 0.95,
    });

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      if (!reduced && heroTitleRef.current) {
        const split = new SplitType(heroTitleRef.current, { types: "words" });
        gsap.from(split.words, {
          yPercent: 120,
          opacity: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
        });
      }

      gsap.utils.toArray(".ev-reveal").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      });

      if (!reduced && heroVisualRef.current) {
        gsap.to(heroVisualRef.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (timelineRef.current && timelineProgressRef.current) {
        gsap.to(timelineProgressRef.current, {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        });

        gsap.utils.toArray(".ev-timeline-step").forEach((stepEl, index) => {
          ScrollTrigger.create({
            trigger: stepEl,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActiveStep(index),
            onEnterBack: () => setActiveStep(index),
          });
        });
      }

      counterRefs.current.forEach((el, idx) => {
        if (!el) return;
        const stat = stats[idx];
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: stat.value,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          onUpdate: () => {
            const rounded = Math.round(proxy.value);
            el.textContent = `${rounded}${stat.suffix}`;
          },
        });
      });
    });

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsHeaderScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="ev-page min-h-screen bg-[#f5f7ff] text-slate-900">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isHeaderScrolled
            ? "border-b border-white/20 bg-[#0b1a57]/70 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 ${
            isHeaderScrolled ? "h-16" : "h-20"
          }`}
        >
          <a href="#home" className="flex items-center gap-2 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ffb437] to-[#f38d14]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="ev-heading text-xl font-semibold">EduVoyage AI</span>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-white/85 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/workspace"
              className="rounded-full bg-[#ffb437] px-5 py-2.5 text-sm font-semibold text-[#11245f] transition hover:bg-[#ffc45f]"
            >
              Start Learning Free
            </Link>
          </nav>

          <button
            aria-label="Toggle menu"
            className="rounded-lg border border-white/25 p-2 text-white lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/15 bg-[#0b1a57] px-4 pb-5 pt-3 lg:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-white/90"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/workspace"
                className="mt-2 rounded-full bg-[#ffb437] px-5 py-2.5 text-center text-sm font-semibold text-[#11245f]"
                onClick={() => setMobileOpen(false)}
              >
                Start Learning Free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          id="home"
          className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1a57_0%,#1f3caa_55%,#0e246f_100%)] pb-16 pt-36 text-white"
        >
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.2]"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/landingpage/ambient-neural-bg.mp4"  />
          </video>
          <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-[#4ad18f]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#ffb437]/25 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="ev-reveal">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                <ShieldCheck className="h-3.5 w-3.5" />
                AI Learning Operating System
              </p>
              <h1
                ref={heroTitleRef}
                className="ev-heading text-4xl leading-tight sm:text-5xl lg:text-6xl"
              >
                Transform Learning Into a Structured Journey With AI
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Generate a personalized course, learn chapter by chapter, test retention
                with quizzes, and earn certificates from one guided workspace.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ffb437] px-6 py-3 text-sm font-bold text-[#132a6c] transition hover:bg-[#ffc45f]"
                >
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#product-demo"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <CirclePlay className="h-4 w-4" />
                  Watch Demo
                </a>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["50K+", "Learners"],
                  ["10K+", "Courses"],
                  ["95%", "Satisfaction"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">
                    <p className="ev-heading text-2xl font-semibold leading-none">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-white/70">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={heroVisualRef} className="ev-reveal">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl shadow-[#09174d]/70 backdrop-blur-sm">
                <VisualBlock
                  src="/landingpage/hero-dashboard-cinematic.png"
                  alt="EduVoyage dashboard preview"
                  className="h-full w-full rounded-2xl object-cover"
                  minHeight={380}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="ev-reveal border-y border-[#d7ddf5] bg-white py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden whitespace-nowrap">
              <div className="ev-marquee inline-flex items-center gap-8 text-sm font-semibold uppercase tracking-wider text-[#1f3caa]">
                <span>Trusted by learners building real career momentum</span>
                <span>Guided progression</span>
                <span>Outcome-focused assessment</span>
                <span>Certificate-ready completion</span>
                <span>Career-aligned pathways</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f5f7ff] py-20" id="problem">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-start lg:px-8">
            <div className="ev-reveal rounded-3xl border border-[#d5dcfb] bg-white p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a60c9]">The Problem</p>
              <h2 className="ev-heading mt-3 text-3xl text-[#11245f] sm:text-4xl">
                Too Much Content, Too Little Structure
              </h2>
              <ul className="mt-6 space-y-4 text-[15px] leading-7 text-slate-600">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#ffb437]" />
                 Learners lose focus by jumping between videos, notes, and documents without a clear roadmap, leaving them overwhelmed by fragmented information.
                </li>

              </ul>
                <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-3">
                <VisualBlock
                  src="/landingpage/problem-content.jpeg"
                  alt="Learning chaos transformed into structure"
                  className="h-full w-full rounded-xl object-cover"
                  minHeight={220}
                />
              </div>
            </div>

            <div className="ev-reveal rounded-3xl border border-[#cad4ff] bg-[linear-gradient(135deg,#11245f_0%,#2746b0_100%)] p-7 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9cc3ff]">The EduVoyage Solution</p>
              <h3 className="ev-heading mt-3 text-3xl sm:text-4xl">One System, From Intention To Completion</h3>
              <p className="mt-4 text-white/80">
                EduVoyage combines generation, guided study, assessment, and certification in one workflow so learners can finish what they start.
              </p>
              <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-3">
                <VisualBlock
                  src="/landingpage/problem-content-overload.png"
                  alt="Learning chaos transformed into structure"
                  className="h-full w-full rounded-xl object-cover"
                  minHeight={220}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20" id="what-it-does">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a60c9]">What It Does</p>
              <h2 className="ev-heading mt-3 text-3xl text-[#11245f] sm:text-4xl">
                Complete Learning Pipeline In One Workspace
              </h2>
              <p className="mt-4 text-slate-600">
                EduVoyage is built to move learners from idea to measurable outcomes without switching tools.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {whatItDoes.map((item) => (
                <div
                  key={item}
                  className="ev-reveal rounded-xl border border-[#dde4ff] bg-[#f8faff] px-4 py-3 text-sm font-semibold text-[#1f3caa]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative overflow-hidden bg-[#0d1f66] py-20 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <VisualBlock
              src="/landingpage/how-it-works-timeline-bg.png"
              alt="Timeline background"
              className="h-full w-full object-cover"
              minHeight={420}
            />
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#89a9ff]">How It Works</p>
              <h2 className="ev-heading mt-3 text-3xl sm:text-4xl">Complete Learning Pipeline In One Scroll</h2>
              <p className="mt-4 text-white/75">
                Every stage is connected so learners always know what to do next.
              </p>
            </div>

            <div ref={timelineRef} className="mt-10 grid gap-8 lg:grid-cols-[140px_1fr]">
              <div className="hidden lg:block">
                <div className="relative mx-auto h-full w-1 rounded-full bg-white/20">
                  <div
                    ref={timelineProgressRef}
                    className="absolute top-0 w-1 rounded-full bg-[#ffb437]"
                    style={{ height: "0%" }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`ev-timeline-step rounded-2xl border p-5 transition ${
                      activeStep === index
                        ? "border-[#ffb437] bg-white/15"
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Step {index + 1}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a60c9]">Core Differentiators</p>
              <h2 className="ev-heading mt-3 text-3xl text-[#11245f] sm:text-4xl">
                Built For Learning Outcomes, Not Feature Checklists
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.25 }}
                    key={feature.title}
                    className="ev-reveal overflow-hidden rounded-2xl border border-[#dae1ff] bg-[#f9fbff]"
                  >
                    <VisualBlock
                      src={feature.image}
                      alt={feature.title}
                      className="h-44 w-full object-cover"
                      minHeight={176}
                    />
                    <div className="p-5">
                      <div className="inline-flex rounded-xl bg-[#1f3caa]/10 p-2 text-[#1f3caa]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 ev-heading text-xl text-[#11245f]">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f7ff] py-20" id="career-layer">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="ev-reveal">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a60c9]">Career + Skills</p>
              <h2 className="ev-heading mt-3 text-3xl text-[#11245f] sm:text-4xl">
                Learn For Career Outcomes, Not Just Completion
              </h2>
              <p className="mt-4 max-w-xl text-slate-600">
                EduVoyage AI Career Advisor and Skill Analyzer connect your course journey to job-ready role direction.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <Brain className="mt-0.5 h-4 w-4 text-[#1f3caa]" />
                  Personalized guidance based on your skill profile.
                </li>
                <li className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-4 w-4 text-[#1f3caa]" />
                  Role-fit recommendations and practical next steps.
                </li>
              </ul>
            </div>

            <div className="ev-reveal grid gap-4 sm:grid-cols-2">
              <VisualBlock
                src="/landingpage/career-advisor-panel.png"
                alt="Career advisor panel"
                className="h-full w-full rounded-2xl border border-[#d6ddfb] object-cover"
                minHeight={240}
              />
              <VisualBlock
                src="/landingpage/skill-analyzer-panel.png"
                alt="Skill analyzer panel"
                className="h-full w-full rounded-2xl border border-[#d6ddfb] object-cover"
                minHeight={240}
              />
            </div>
          </div>
        </section>

        <section id="product-demo" className="bg-[#09174d] py-20 text-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98b4ff]">Product Preview</p>
              <h2 className="ev-heading mt-3 text-3xl sm:text-4xl">Watch EduVoyage In Action</h2>
            </div>
            <div className="ev-reveal overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-3">
              <video
                className="h-full w-full rounded-2xl object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
                poster="/landingpage/eduvoyage-demo-loop.mp4"
              >
                <source src="/landingpage/eduvoyage-demo-loop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section id="outcomes" className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, idx) => (
                <div key={stat.label} className="ev-reveal rounded-2xl border border-[#d7defa] bg-[#f8faff] p-5">
                  <p
                    ref={(el) => {
                      counterRefs.current[idx] = el;
                    }}
                    className="ev-heading text-4xl text-[#11245f]"
                  >
                    0{stat.suffix}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <article key={item.name} className="ev-reveal rounded-2xl border border-[#dde4ff] bg-white p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <VisualBlock
                      src={item.avatar}
                      alt={item.name}
                      className="h-12 w-12 rounded-full object-cover"
                      minHeight={48}
                    />
                    <div>
                      <p className="ev-heading text-base text-[#11245f]">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">"{item.text}"</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#f5f7ff] py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a60c9]">Pricing</p>
              <h2 className="ev-heading mt-3 text-3xl text-[#11245f] sm:text-4xl">
                Start Free, Upgrade When You Need More Scale
              </h2>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <article className="ev-reveal rounded-3xl border border-[#d7ddf9] bg-white p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4b61c9]">Free</p>
                <p className="mt-3 ev-heading text-4xl text-[#11245f]">$0</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  <li>Generate initial courses with guided chapters</li>
                  <li>Track progress and run quizzes</li>
                  <li>Preview certificate eligibility</li>
                </ul>
              </article>

              <article className="ev-reveal rounded-3xl border border-[#f1c56a] bg-[linear-gradient(135deg,#11245f_0%,#1f3caa_100%)] p-7 text-white shadow-xl shadow-[#17348d]/35">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ffcb63]">Premium</p>
                <p className="mt-3 ev-heading text-4xl">Custom Plan</p>
                <ul className="mt-6 space-y-3 text-sm text-white/85">
                  <li>Higher generation limits and deeper AI support</li>
                  <li>Full career advisor and skill analyzer workflows</li>
                  <li>Advanced progress insights and completion velocity</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#0d1f66] py-20 text-white">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="ev-reveal rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-sm sm:p-10">
              <h2 className="ev-heading text-3xl sm:text-4xl">Start Your First AI Learning Journey Today</h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/80">
                Move from intention to completion with a structured AI-powered learning system.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/workspace"
                  className="rounded-full bg-[#ffb437] px-6 py-3 text-sm font-bold text-[#11245f] transition hover:bg-[#ffc45f]"
                >
                  Start Learning Free
                </Link>
                <a
                  href="#product-demo"
                  className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Demo Course
                </a>
              </div>
            </div>

            <footer className="mt-10 border-t border-white/20 pt-6 text-sm text-white/70">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p>EduVoyage AI</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href="#features" className="text-white/80 hover:text-white">Product</a>
                  <a href="#pricing" className="text-white/80 hover:text-white">Pricing</a>
                  <a href="#contact" className="text-white/80 hover:text-white">Contact</a>
                  <a href="#" className="text-white/80 hover:text-white">Privacy</a>
                  <a href="#" className="text-white/80 hover:text-white">Terms</a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    LinkedIn
                  </a>
                  <a href="https://x.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">
                    X
                  </a>
                  <a href="mailto:support@eduvoyage.com" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                    <Mail className="h-4 w-4" /> support@eduvoyage.com
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap");

        .ev-page {
          font-family: "Manrope", "Segoe UI", sans-serif;
        }

        #home,
        #problem,
        #what-it-does,
        #how-it-works,
        #features,
        #outcomes,
        #pricing,
        #contact {
          scroll-margin-top: 96px;
        }

        .ev-heading {
          font-family: "Sora", "Manrope", sans-serif;
          letter-spacing: -0.02em;
        }

        .ev-marquee {
          animation: ev-marquee 18s linear infinite;
        }

        @keyframes ev-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-40%);
          }
        }

        @media (max-width: 767px) {
          .ev-marquee {
            animation-duration: 14s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ev-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
