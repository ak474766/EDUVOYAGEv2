// app/landing-page.jsx (or pages/landing-page.jsx)
// "use client" is needed for Framer Motion, Skiper animated components, and client-only UI.
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Icons (lucide-react)
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Youtube,
  BarChart3,
  Quote,
  Share2,
  Target,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";

// shadcn/ui NavigationMenu (ensure added to your project via shadcn generator)
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../@/components/ui/navigation-menu.jsx";

// Skiper-UI components (ensure added via Skiper registry using shadcn-style add)
import { CardCarousel } from "../@/components/ui/card-carousel";
import { Card } from "../@/components/ui/card";
import { CardDeckSwiper } from "../@/components/ui/card-deck-swiper.jsx";
import ShareButton from "../@/components/ui/share-button.jsx";
import { TextScroll } from "../@/components/ui/text-scroll.jsx";
import ImageCursorTrail from "./workspace/_components/image-cursortrail.jsx";
import ThemeToggleButton from "../components/ui/theme-toggle-button.jsx";

export default function EduVoyageLandingPage() {
  // Data: CardCarousel images (represent each learning pillar)
  const carouselImages = [
    { src: "/images/ai-course.png", alt: "AI Course Generation" },
    { src: "/images/youtube-enrich.png", alt: "YouTube Enrichment" },
    { src: "/images/progress-track.png", alt: "Progress Tracking" },
    { src: "/images/ai-career-advisor.png", alt: "Ai Career Advisor" },
    { src: "/images/skills-analyzer.png", alt: "Skills Analyzer" },
  ];

  // Data: "How it works" steps
  const steps = [
    {
      title: "Enter Topic",
      desc: "Describe a subject or paste a link—EduVoyage builds a tailored learning plan.",
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      gradient: "from-blue-400 to-purple-500",
    },
    {
      title: "Learn Content",
      desc: "Digest AI-curated lessons, enriched with videos, summaries, and quizzes.",
      icon: <Youtube className="h-6 w-6 text-purple-500" />,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "Track Progress",
      desc: "Stay on track with goals, streaks, and a live mastery score.",
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      gradient: "from-pink-400 to-rose-500",
    },
  ];

  // Data: Testimonials (CardSwipe)
  const testimonials = [
    {
      quote:
        "EduVoyage helped me master React in two weeks by turning videos into focused lessons.",
      author: "Ananya, CS Undergrad",
      role: "Frontend Learner",
      rating: 5,
    },
    {
      quote:
        "I finally finished my ML roadmap—bite-sized modules and progress tracking kept me motivated.",
      author: "Rahul, Data Analyst",
      role: "ML Enthusiast",
      rating: 5,
    },
    {
      quote:
        "As a working professional, the adaptive plan fit my schedule perfectly.",
      author: "Sneha, Product Manager",
      role: "Career Switcher",
      rating: 5,
    },
    {
      quote:
        "The AI-generated quizzes and flashcards made studying so much more effective. I improved my test scores by 40%!",
      author: "Priya, Medical Student",
      role: "Healthcare Professional",
      rating: 5,
    },
    {
      quote:
        "From zero to hero in Python programming. The personalized learning path was exactly what I needed to break into tech.",
      author: "Arjun, Software Engineer",
      role: "Career Changer",
      rating: 5,
    },
    {
      quote:
        "The progress tracking and streak system kept me accountable. I've been learning consistently for 6 months now!",
      author: "Zara, Marketing Manager",
      role: "Lifelong Learner",
      rating: 5,
    },
  ];

  // Data: Stats
  const stats = [
    { number: "50K+", label: "Active Learners", icon: Users },
    { number: "95%", label: "Success Rate", icon: Target },
    { number: "2.5x", label: "Faster Learning", icon: TrendingUp },
    { number: "4.9/5", label: "User Rating", icon: Star },
  ];

  // Data: ImageCursorTrail demo images
  const cursorTrailImages = [
    "https://images.pexels.com/photos/30082445/pexels-photo-30082445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.unsplash.com/photo-1692606743169-e1ae2f0a960f?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1644141655284-2961181d5a02?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.pexels.com/photos/30082445/pexels-photo-30082445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://assets.lummi.ai/assets/QmNfwUDpehZyLWzE8to7QzgbJ164S6fQy8JyUWemHtmShj?auto=format&w=1500",
    "https://images.unsplash.com/photo-1706049379414-437ec3a54e93?q=80&w=1200&auto=format",
    "https://assets.lummi.ai/assets/Qmb2P6tF2qUaFXnXpnnp2sk9HdVHNYXUv6MtoiSq7jjVhQ?auto=format&w=1500",
    "https://images.unsplash.com/photo-1508873881324-c92a3fc536ba?q=80&w=1200&auto=format",
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-violet-100 to-purple-200 text-gray-900 dark:from-neutral-900 dark:via-neutral-950 dark:to-black dark:text-neutral-100">
      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-300/30 to-pink-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-blue-300/30 to-violet-300/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-200/20 to-pink-200/20 blur-3xl" />
      </div>

      <HeaderNav />

      {/* Hero - Marquee Background with Centered CTA */}
      <MarqueeHero />

      {/* Stats Section */}
      <section className="relative py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50, scale: 0.8, rotateX: -15 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: i * 0.15,
                  },
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="group rounded-2xl border border-purple-100 dark:border-white/10 bg-white/60 dark:bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:dark:bg-white/10"
              >
                <motion.div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{
                    scale: 1,
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: i * 0.15 + 0.2,
                    },
                  }}
                  viewport={{ once: true }}
                >
                  <stat.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </motion.div>
                <motion.div
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                      delay: i * 0.15 + 0.3,
                    },
                  }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <motion.div
                  className="text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: i * 0.15 + 0.4,
                    },
                  }}
                  viewport={{ once: true }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything you need */}
      <section id="features" className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mt-16 max-w-full">
            {/* Skiper CardCarousel: pass three images (use your real assets) */}
            <CardCarousel
              images={carouselImages}
              autoplayDelay={2800}
              showPagination={false}
              showNavigation={false}
            />
          </div>

          {/* Enhanced feature cards */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <FeatureMiniCard
              title="AI Course Generation"
              desc="Auto-build tailored syllabi, modules, and quizzes with intelligent content curation."
              icon={<BookOpen className="h-6 w-6 text-purple-500" />}
              gradient="from-blue-400 to-purple-500"
            />
            <FeatureMiniCard
              title="YouTube Enrichment"
              desc="Transform videos into structured notes, flashcards, and interactive tests."
              icon={<Youtube className="h-6 w-6 text-purple-500" />}
              gradient="from-purple-400 to-pink-500"
            />
            <FeatureMiniCard
              title="Progress Tracking"
              desc="Visualize mastery scores, maintain streaks, and track learning milestones."
              icon={<BarChart3 className="h-6 w-6 text-purple-500" />}
              gradient="from-pink-400 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* How it works - New Three Card Section */}
      <section id="how-it-works" className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              How it works
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Get started in three simple steps and begin your learning journey
            </p>
          </motion.div>

          {/* Step 1: Enter Topic */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="section-5050_container grid center mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image Container */}
              <div className="section-5050_media-container">
                <div className="image-container_wrap rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    loading="lazy"
                    alt="AI Course Generation Interface"
                    className="img-cover w-full h-[400px] object-cover"
                  />
                </div>
              </div>

              {/* Content Container */}
              <div className="section-5050_content-container">
                <div className="molecule-5050_text-content_wrap">
                  <p className="u-text-eyebrow text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4">
                    Step 1: Enter Topic
                  </p>
                  <div className="slot-5050_text-content_inner-container">
                    <h2 className="u-heading-md text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      Describe your learning goal
                    </h2>
                    <div className="content-rich-text w-richtext">
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Simply describe a subject you want to learn or paste a
                        YouTube link. Our AI analyzes your input and builds a
                        comprehensive, tailored learning plan with structured
                        modules, quizzes, and progress tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Learn Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="section-5050_container grid center mb-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content Container - Left side for this step */}
              <div className="section-5050_content-container lg:order-1">
                <div className="molecule-5050_text-content_wrap">
                  <p className="u-text-eyebrow text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4">
                    Step 2: Learn Content
                  </p>
                  <div className="slot-5050_text-content_inner-container">
                    <h2 className="u-heading-md text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      Digest AI-curated lessons
                    </h2>
                    <div className="content-rich-text w-richtext">
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Access enriched learning materials including video
                        summaries, interactive flashcards, practice quizzes, and
                        detailed notes. Our AI enhances YouTube content with
                        structured learning paths and personalized
                        recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Container - Right side for this step */}
              <div className="section-5050_media-container lg:order-2">
                <div className="image-container_wrap rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    loading="lazy"
                    alt="Interactive Learning Dashboard"
                    className="img-cover w-full h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Track Progress */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="section-5050_container grid center"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image Container */}
              <div className="section-5050_media-container">
                <div className="image-container_wrap rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    loading="lazy"
                    alt="Progress Analytics Dashboard"
                    className="img-cover w-full h-[400px] object-cover"
                  />
                </div>
              </div>

              {/* Content Container */}
              <div className="section-5050_content-container">
                <div className="molecule-5050_text-content_wrap">
                  <p className="u-text-eyebrow text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4">
                    Step 3: Track Progress
                  </p>
                  <div className="slot-5050_text-content_inner-container">
                    <h2 className="u-heading-md text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      Monitor your learning journey
                    </h2>
                    <div className="content-rich-text w-richtext">
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        Stay motivated with detailed progress analytics,
                        learning streaks, and mastery scores. Visualize your
                        growth with interactive charts and receive personalized
                        insights to optimize your learning path.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="section-5050_container grid center"
          ></motion.div>
        </div>
      </section>

      {/* New Design Section - Similar to Reference Image */}
      <section className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="grid lg:grid-cols-2 h-[500px]">
              {/* Left Section - Dark Background */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-12 flex flex-col justify-center relative">
                {/* Logo/Brand */}
                <div className="absolute top-8 left-8">
                  <span className="text-white font-bold text-2xl">
                    EduVoyage
                  </span>
                </div>

                {/* Main Content */}
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to transform your learning?
                  </h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Join thousands of learners who have accelerated their
                    education with AI-powered personalized courses and progress
                    tracking.
                  </p>

                  {/* CTA Button */}
                  <Link
                    href="/workspace"
                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-800 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                  >
                    Start Learning Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Right Section - Light Background with Image */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 relative overflow-hidden">
                {/* Main Image */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                    alt="Students learning together"
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                  />
                </div>

                {/* Navigation Element - Bottom Right */}
                <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                  <div className="flex flex-col gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600"
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
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              What learners say
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Join thousands of satisfied learners who have transformed their
              education
            </p>
          </motion.div>

          <div className="mt-16 max-w-4xl mx-auto px-4">
            {/* CardDeckSwiper: swipeable testimonials */}
            <CardDeckSwiper
              cards={testimonials}
              autoplayDelay={3000}
              showNavigation={true}
              enableTouchGestures={true}
              enableKeyboardNavigation={true}
              className="max-w-4xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA + Share */}
      <section id="get-started" className="relative py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-purple-200 dark:border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/10 dark:to-pink-400/10 p-12 text-center backdrop-blur-sm">
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-300/20 to-violet-300/20 blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <TextScroll
                uptext="Ready to start the journey?"
                bwtext="Build a learning path in minutes and accelerate toward mastery"
                upclassName="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl"
                bwclassName="text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-3xl"
              ></TextScroll>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/workspace"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
                >
                  Start for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/workspace/billing"
                  className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-purple-200 dark:border-purple-900/40 bg-white/80 dark:bg-white/10 px-8 py-4 font-semibold text-purple-700 dark:text-purple-200 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-white hover:shadow-xl hover:dark:border-purple-800 hover:dark:bg-white/20"
                >
                  See pricing
                </Link>

                {/* Skiper ShareButton at the end */}
                <div className="mt-10 flex items-center justify-center">
                <ShareButton
                  className="px-8 py-3"
                  shareUrl="https://eduvoyage.app"
                  shareTitle="EduVoyage"
                  shareText="Check out EduVoyage - the AI-powered learning platform that creates personalized courses!"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share EduVoyage</span>
                </ShareButton>
              </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ===== UI Bits ===== */
function HeaderNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 backdrop-blur-md">
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="group flex items-center gap-3 rounded-xl p-2.5 pr-3 transition-transform motion-safe:hover:translate-x-[1px]">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white ring-1 ring-black/10 shadow-md shadow-black/10">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">EduVoyage logo</span>
            </div>

            <div className="flex flex-col">
              <span className="text-base font-semibold leading-5 text-gray-900 dark:text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                  EduVoyage
                </span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Learning platform</span>
            </div>
          </div>
        </Link>

        {/* Theme toggle + shadcn/ui NavigationMenu */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                Product
              </NavigationMenuTrigger>
              <NavigationMenuContent className="rounded-xl border border-purple-100 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 p-4 backdrop-blur-md">
                <ul className="grid w-[320px] gap-3">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#features"
                        className="block rounded-lg p-3 text-gray-700 dark:text-gray-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Features
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#how-it-works"
                        className="block rounded-lg p-3 text-gray-700 dark:text-gray-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        How it works
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#testimonials"
                        className="block rounded-lg p-3 text-gray-700 dark:text-gray-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Testimonials
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/workspace/billing"
                  className="rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/workspace"
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40"
                >
                  Sign up
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        </div>
      </div>
    </header>
  );
}

function FeatureMiniCard({ title, desc, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl border border-purple-100 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:dark:bg-white/10"
    >
      <div
        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{desc}</p>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-purple-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/70 py-16 text-sm text-gray-600 dark:text-gray-300 backdrop-blur-sm">
      <div className="container mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
        <div>
          <div className="mb-4 font-semibold text-gray-900 dark:text-white">Product</div>
          <ul className="space-y-3">
            <li>
              <Link
                href="#features"
                className="transition-colors hover:text-purple-600"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="transition-colors hover:text-purple-600"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-purple-600"
              >
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 font-semibold text-gray-900 dark:text-white">Company</div>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Press
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 font-semibold text-gray-900 dark:text-white">Support</div>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Help Center
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Status
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 font-semibold text-gray-900 dark:text-white">Social</div>
          <ul className="space-y-3">
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                Twitter/X
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="transition-colors hover:text-purple-600"
              >
                LinkedIn
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-12 max-w-6xl border-t border-purple-200 dark:border-white/10 px-4 pt-8 text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} EduVoyage. All rights reserved.
      </div>
    </footer>
  );
}

/* ===== Hero Components ===== */
function MarqueeHero() {
  const sliderImages = [
    "/images/ai-course.png",
    "/images/youtube-enrich.png",
    "/images/progress-track.png",
    "/images/ai-career-advisor.png",
    "/images/skills-analyzer.png",
  ];
  const cursorTrailImages = [
    "https://images.pexels.com/photos/30082445/pexels-photo-30082445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.unsplash.com/photo-1692606743169-e1ae2f0a960f?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format",
    "https://images.unsplash.com/photo-1644141655284-2961181d5a02?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.pexels.com/photos/30082445/pexels-photo-30082445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://assets.lummi.ai/assets/QmNfwUDpehZyLWzE8to7QzgbJ164S6fQy8JyUWemHtmShj?auto=format&w=1500",
    "https://images.unsplash.com/photo-1706049379414-437ec3a54e93?q=80&w=1200&auto=format",
    "https://assets.lummi.ai/assets/Qmb2P6tF2qUaFXnXpnnp2sk9HdVHNYXUv6MtoiSq7jjVhQ?auto=format&w=1500",
    "https://images.unsplash.com/photo-1508873881324-c92a3fc536ba?q=80&w=1200&auto=format",
  ];

  return (
    <section className="relative w-full h-[650px] overflow-hidden bg-black">
      {/* Moving image strips */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-0 right-0 top-10 flex gap-6 will-change-transform animate-[marquee_80s_linear_infinite]">
          {sliderImages.concat(sliderImages).map((src, idx) => (
            <img
              key={`row1-${idx}`}
              alt={`slider ${idx + 1}`}
              loading="lazy"
              width="300"
              height="400"
              className="h-[500px] w-[300px] object-cover rounded-xl mx-5"
              src={src}
            />
          ))}
        </div>
        <div className="absolute left-0 right-0 top-[240px] flex gap-6 will-change-transform animate-[marquee_80s_linear_infinite_reverse]">
          {sliderImages.concat(sliderImages).map((src, idx) => (
            <img
              key={`row2-${idx}`}
              alt={`slider ${idx + 1}`}
              loading="lazy"
              width="300"
              height="400"
              className="h-[500px] w-[300px] object-cover rounded-xl mx-5"
              src={src}
            />
          ))}
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 z-10" />
      <ImageCursorTrail
        items={cursorTrailImages}
        maxNumberOfImages={5}
        distance={25}
        imgClass="sm:w-40 w-28 sm:h-48 h-36 rounded-2xl shadow-lg"
        className="w-full "
        fadeAnimation={true}
      >
        {/* Centered content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-light leading-tight mb-4">
            Create Stunning{" "}
            <strong className="font-bold">personalized courses</strong> With
            <br />
            <span className="text-pink-400">
              Everything You Need to Learn, Faster
            </span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-6">
            Accelerate your learning journey with AI: generate personalized
            courses, discover enriching YouTube content, track detailed progress
            analytics, and access comprehensive study tools — all in one place.
          </p>
          <div className="flex items-center gap-4">
            <div className="px-2 p-2 border rounded-full flex gap-5 items-center bg-white/10 backdrop-blur-sm border-white/20">
              <span className="text-sm font-normal w-[150px] md:w-[250px] lg:w-[450px] text-start px-4 text-gray-200">
                <TypingTicker
                  phrases={[
                    "Generate Python course for beginners",
                    "Generate machine learning bootcamp course",
                    "Create cybersecurity basics series",
                  ]}
                />
              </span>
              <Link href="/workspace">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-8 px-3 text-xs rounded-full bg-gradient-to-r from-[#BE575F] via-[#A338E3] to-[#AC76D6] text-white">
                  Try Now <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </ImageCursorTrail>
      {/* Local keyframes for marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee_reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-\[marquee_80s_linear_infinite\] {
          animation: marquee 80s linear infinite;
        }
        .animate-\[marquee_80s_linear_infinite_reverse\] {
          animation: marquee_reverse 80s linear infinite;
        }
      `}</style>
    </section>
  );
}

function TypingTicker({ phrases }) {
  const [index, setIndex] = React.useState(0);
  const [display, setDisplay] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const full = phrases[index % phrases.length];
    const isDone = display === full;

    const timeout = setTimeout(
      () => {
        if (!deleting) {
          // typing
          const next = full.slice(0, display.length + 1);
          setDisplay(next);
          if (next === full) {
            setTimeout(() => setDeleting(true), 1200);
          }
        } else {
          // deleting
          const next = full.slice(0, display.length - 1);
          setDisplay(next);
          if (next.length === 0) {
            setDeleting(false);
            setIndex((i) => (i + 1) % phrases.length);
          }
        }
      },
      deleting ? 40 : 70
    );

    return () => clearTimeout(timeout);
  }, [display, deleting, index, phrases]);

  return (
    <span className="inline-flex items-center">
      {display}
      <span className="ml-1 inline-block h-5 w-[2px] bg-gray-200 animate-pulse" />
    </span>
  );
}
