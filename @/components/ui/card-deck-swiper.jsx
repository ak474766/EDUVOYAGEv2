"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

export const CardDeckSwiper = ({
  cards = [],
  autoplayDelay = 3000,
  showNavigation = true,
  className = "",
  enableTouchGestures = true,
  enableKeyboardNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiAnimation, setShowEmojiAnimation] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ x: 0, y: 0 });
  const autoPlayRef = useRef(null);
  const containerRef = useRef(null);

  // Emoji options for random selection
  const emojis = [
    "🚀",
    "✨",
    "💫",
    "🌟",
    "⭐",
    "🎉",
    "🔥",
    "💎",
    "🎯",
    "🏆",
    "💪",
    "🎊",
  ];

  // Function to show emoji animation
  const showEmoji = (x, y) => {
    setEmojiPosition({ x, y });
    setShowEmojiAnimation(true);
    setTimeout(() => setShowEmojiAnimation(false), 1000);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && autoplayDelay > 0 && !isDragging) {
      autoPlayRef.current = setTimeout(() => {
        nextCard();
      }, autoplayDelay);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, autoplayDelay, isDragging]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevCard();
          // Show emoji animation for keyboard navigation
          showEmoji(window.innerWidth / 2 - 50, window.innerHeight / 2);
          break;
        case "ArrowRight":
          event.preventDefault();
          nextCard();
          // Show emoji animation for keyboard navigation
          showEmoji(window.innerWidth / 2 + 50, window.innerHeight / 2);
          break;
        case "Home":
          event.preventDefault();
          goToCard(0);
          break;
        case "End":
          event.preventDefault();
          goToCard(cards.length - 1);
          break;
        case " ":
          event.preventDefault();
          setIsAutoPlaying(!isAutoPlaying);
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabIndex", "0");
      container.setAttribute("role", "region");
      container.setAttribute("aria-label", "Card deck swiper");
    }

    return () => {
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [enableKeyboardNavigation, isAutoPlaying, cards.length]);

  const nextCard = (isManual = false) => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    if (isManual) {
      // Show emoji animation for manual navigation
      showEmoji(window.innerWidth / 2 + 50, window.innerHeight / 2);
    }
  };

  const prevCard = (isManual = false) => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    if (isManual) {
      // Show emoji animation for manual navigation
      showEmoji(window.innerWidth / 2 - 50, window.innerHeight / 2);
    }
  };

  const goToCard = (index) => {
    setCurrentIndex(index);
  };

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  // Handle drag gestures
  const handleDragStart = () => {
    setIsDragging(true);
    pauseAutoPlay();
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    resumeAutoPlay();

    if (enableTouchGestures) {
      const swipeThreshold = 50;
      const { offset } = info;

      if (Math.abs(offset.x) > swipeThreshold) {
        if (offset.x > 0) {
          prevCard(true); // Manual swipe
          // Show emoji at swipe position
          showEmoji(event.clientX, event.clientY);
        } else {
          nextCard(true); // Manual swipe
          // Show emoji at swipe position
          showEmoji(event.clientX, event.clientY);
        }
      }
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No cards to display
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-4xl mx-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-2xl ${className}`}
      tabIndex="0"
    >
      {/* Emoji Animation Overlay */}
      <AnimatePresence>
        {showEmojiAnimation && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute text-4xl select-none"
              style={{
                left: emojiPosition.x,
                top: emojiPosition.y,
                transform: "translate(-50%, -50%)",
              }}
              initial={{
                scale: 0,
                rotate: -180,
                y: 0,
              }}
              animate={{
                scale: [0, 1.5, 1],
                rotate: [0, 360],
                y: [-20, -60, -100],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            >
              {emojis[Math.floor(Math.random() * emojis.length)]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack Container */}
      <div className="relative h-[500px] w-full">
        <AnimatePresence mode="wait">
          {cards.map((card, index) => {
            // Calculate position in the stack
            const stackPosition =
              (index - currentIndex + cards.length) % cards.length;
            const isActive = stackPosition === 0;
            const isNext = stackPosition === 1;
            const isVisible = stackPosition <= 2; // Show only top 3 cards

            if (!isVisible) return null;

            return (
              <motion.div
                key={`${card.id || index}-${currentIndex}`}
                className={`absolute inset-0 w-full h-full`}
                initial={false}
                animate={{
                  scale: isActive ? 1 : isNext ? 0.92 : 0.84,
                  y: isActive ? 0 : isNext ? 25 : 50,
                  zIndex: isActive ? 30 : isNext ? 20 : 10,
                  opacity: isActive ? 1 : isNext ? 0.85 : 0.7,
                  rotateY: isActive ? 0 : isNext ? 3 : 6,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.6,
                }}
                onHoverStart={pauseAutoPlay}
                onHoverEnd={resumeAutoPlay}
                // Add drag functionality for the active card
                drag={isActive && enableTouchGestures ? "x" : false}
                dragConstraints={{ left: -100, right: 100 }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                whileDrag={{
                  scale: 1.02,
                  rotateY: 0,
                  zIndex: 40,
                }}
                role="group"
                aria-label={`Card ${index + 1} of ${cards.length}`}
                aria-hidden={!isActive}
              >
                {/* Card Content */}
                <div className="relative w-full h-full">
                  <motion.div
                    className="w-full h-full bg-white rounded-3xl shadow-2xl border border-purple-100/50 p-8 flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Enhanced Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 rounded-3xl" />

                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.02]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
                    </div>

                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div
                        className="flex gap-1"
                        role="img"
                        aria-label={`${card.rating || 5} out of 5 stars`}
                      >
                        {Array.from({ length: card.rating || 5 }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm"
                            />
                          )
                        )}
                      </div>
                      <div className="relative">
                        <Quote
                          className="h-10 w-10 text-purple-400/70"
                          aria-hidden="true"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-sm" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 relative z-10">
                      <blockquote className="text-xl text-gray-800 leading-relaxed mb-6 font-medium">
                        "{card.quote || card.content}"
                      </blockquote>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-purple-100/50 pt-6 relative z-10">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {card.author || card.name}
                        </span>
                        {card.role && <> • {card.role}</>}
                      </div>
                    </div>

                    {/* Swipe Indicator (only for active card) */}
                    {isActive && enableTouchGestures && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-purple-400/60 font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-200/50">
                        ← Swipe to navigate →
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Buttons */}
      {showNavigation && cards.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => prevCard(true)} // Manual navigation
            className="pointer-events-auto w-14 h-14 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-purple-200/50 flex items-center justify-center text-purple-600 hover:bg-white hover:shadow-2xl transition-all duration-300 -ml-7 group"
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
            aria-label="Previous card"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-full blur-sm group-hover:blur-md transition-all duration-300" />
            <ChevronLeft className="h-7 w-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => nextCard(true)} // Manual navigation
            className="pointer-events-auto w-14 h-14 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-purple-200/50 flex items-center justify-center text-purple-600 hover:bg-white hover:shadow-2xl transition-all duration-300 -mr-7 group"
            onMouseEnter={pauseAutoPlay}
            onMouseLeave={resumeAutoPlay}
            aria-label="Next card"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-full blur-sm group-hover:blur-md transition-all duration-300" />
            <ChevronRight className="h-7 w-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Default export for easier importing
export default CardDeckSwiper;
