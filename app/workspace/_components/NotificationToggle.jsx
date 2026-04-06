"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, X, ChevronRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { createPortal } from "react-dom";

function NotificationToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      updateDropdownPosition();
    }
  }, [isOpen]);

  // Listen for certificate issued events to push a completion notification
  useEffect(() => {
    const onCertificateIssued = (e) => {
      try {
        const { courseId, courseName, certificateId, issuedAt } =
          e.detail || {};
        const message = `🎉 Congratulations! You completed "${
          courseName || "Course"
        }". Certificate issued.`;
        const timestamp = issuedAt
          ? new Date(issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleDateString();

        setNotifications((prev) => [
          {
            id: Date.now(),
            courseName: courseName || "Course",
            courseId,
            message,
            timestamp,
            type: "certificate",
            certificateId,
          },
          ...prev,
        ]);
        setIsOpen(true);
      } catch (err) {
        // no-op
      }
    };

    window.addEventListener("certificate-issued", onCertificateIssued);
    return () =>
      window.removeEventListener("certificate-issued", onCertificateIssued);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [isOpen]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 320; // w-80 = 320px

      // Calculate position
      let left = rect.right - dropdownWidth;

      // Ensure dropdown doesn't go off-screen
      if (left < 10) {
        left = 10;
      } else if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }

      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap
        left: left,
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [enrollRes, certRes] = await Promise.all([
        axios.get("/api/enroll-course"),
        axios.get("/api/certificates"),
      ]);

      const enrolledCourses = enrollRes.data || [];
      const certificates = certRes.data || [];

      const enrollmentNotifications = enrolledCourses.map(
        (enrollment, index) => ({
          id: `enroll-${index + 1}`,
          courseName: enrollment.courses?.name || "Course",
          courseId: enrollment.courses?.cid,
          message: `🎉 Congratulations! You've successfully enrolled in "${
            enrollment.courses?.name || "Course"
          }"`,
          timestamp: enrollment.enrollCourse?.enrolledAt
            ? new Date(enrollment.enrollCourse.enrolledAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : new Date().toLocaleDateString(),
          type: "enrollment",
        })
      );

      const certificateNotifications = certificates.map((c, idx) => ({
        id: `cert-${idx + 1}`,
        courseName: c.courseName || "Course",
        courseId: c.cid,
        message: `🏅 Course Completed! Certificate issued for "${
          c.courseName || "Course"
        }"`,
        timestamp: c.issuedAt
          ? new Date(c.issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleDateString(),
        type: "certificate",
        certificateId: c.certificateId,
      }));

      // Merge and sort by timestamp descending if possible
      const all = [...enrollmentNotifications, ...certificateNotifications];
      setNotifications(all);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedNotifications = notifications.slice(0, 5);
  const hasMoreNotifications = notifications.length > 5;

  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998] bg-black/5"
          onClick={() => setIsOpen(false)}
        />

        {/* Dropdown */}
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-80 bg-background rounded-xl shadow-2xl border border-border max-h-96 overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <h3 className="font-semibold text-foreground text-base">
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors duration-150"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto bg-background">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : displayedNotifications.length > 0 ? (
              <div className="p-2">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg hover:bg-muted/50 transition-colors duration-150 border-b border-border last:border-b-0 cursor-pointer"
                    onClick={() => {
                      window.location.href = `/workspace/view-course/${notification.courseId}`;
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Enroll in courses to see notifications
                </p>
              </div>
            )}
          </div>

          {/* Footer with See All button */}
          <div className="p-3 border-t border-border bg-muted/50">
            <Link
              href="/workspace/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-end gap-2 w-full py-2.5 px-3 text-sm text-primary hover:bg-primary/10 rounded-lg transition-all duration-150 font-medium"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="p-2.5 rounded-lg glass border-soft shadow-soft transition-all duration-200 hover:shadow-md hover:scale-[1.03] hover:bg-background/60 relative group"
      >
        <Bell className="w-5 h-5 text-foreground/85 group-hover:text-foreground transition-colors" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 ring-2 ring-background" />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none border border-border shadow-lg z-50">
        Notifications
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45 border-l border-t border-border" />
      </div>

      {/* Render dropdown using portal */}
      {renderDropdown()}
    </div>
  );
}

export default NotificationToggle;
