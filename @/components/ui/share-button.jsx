"use client";
import React, { useState } from "react";
import { Share2, Twitter, Linkedin } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../../@/components/ui/button";

// Custom Instagram Icon Component
const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const ShareButton = ({
  className,
  links,
  children,
  shareUrl = "https://eduvoyage.app",
  shareTitle = "EduVoyage",
  shareText = "Check out EduVoyage - the AI-powered learning platform that creates personalized courses!",
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Function to show copied message
  const showCopiedNotification = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  // Default social media sharing functions
  const defaultLinks = [
    {
      icon: Share2,
      onClick: () => {
        if (navigator.share) {
          navigator
            .share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
            })
            .catch(() => {});
        } else {
          navigator.clipboard && navigator.clipboard.writeText(shareUrl);
          showCopiedNotification();
        }
      },
      label: "Share",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Twitter,
      onClick: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "width=600,height=400");
      },
      label: "Share on Twitter",
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      icon: Linkedin,
      onClick: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        window.open(linkedinUrl, "_blank", "width=600,height=400");
      },
      label: "Share on LinkedIn",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: InstagramIcon,
      onClick: () => {
        // Instagram doesn't support direct URL sharing, so we copy the URL
        navigator.clipboard && navigator.clipboard.writeText(shareUrl);
        showCopiedNotification();
      },
      label: "Copy for Instagram",
      color:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    },
  ];

  // Use provided links or default ones
  const shareLinks = links || defaultLinks;

  return (
    <div className="relative">
      {/* Copied Notification */}
      {showCopiedMessage && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-in fade-in duration-200">
          Link copied to clipboard! 📋
        </div>
      )}

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          className={cn(
            "relative min-w-40  rounded-3xl ",
            "bg-white dark:bg-black",
            "hover:bg-gray-50 dark:hover:bg-gray-950",
            "text-black dark:text-white",
            "border border-black/10 dark:border-white/10",
            "transition-all duration-300",
            isHovered ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        >
          <span className="flex items-center gap-2">{children}</span>
        </Button>
        <div className="absolute left-0 top-0 flex h-10">
          {shareLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                type="button"
                key={index}
                onClick={link.onClick}
                title={link.label || `Share option ${index + 1}`}
                className={cn(
                  "h-10",
                  "w-10",
                  "flex items-center justify-center",
                  "text-white",
                  "transition-all duration-300",
                  index === 0 && "rounded-l-3xl",
                  index === shareLinks.length - 1 && "rounded-r-3xl",
                  "border-r border-white/20 last:border-r-0",
                  "hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-white/50",
                  // Use custom color if provided, otherwise use default
                  link.color ||
                    "bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100",
                  isHovered
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-full opacity-0",
                  index === 0 && "transition-all duration-200",
                  index === 1 && "delay-[50ms] transition-all duration-200",
                  index === 2 && "transition-all delay-100 duration-200",
                  index === 3 && "transition-all delay-150 duration-200"
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShareButton;
