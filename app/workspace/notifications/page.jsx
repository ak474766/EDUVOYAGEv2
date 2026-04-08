"use client";
import React, { useEffect, useState } from "react";
import { Bell, Calendar, BookOpen, Award } from "lucide-react";
import axios from "axios";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
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
          courseDescription:
            enrollment.courses?.description || "No description available",
          message: `Congratulations! You've successfully enrolled in "${
            enrollment.courses?.name || "Course"
          }"`,
          timestamp: enrollment.enrollCourse?.enrolledAt
            ? new Date(enrollment.enrollCourse.enrolledAt).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
              )
            : new Date().toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              }),
          type: "enrollment",
          level: enrollment.courses?.level || "Beginner",
          chapters: enrollment.courses?.noOfChapters || 0,
        })
      );

      const certificateNotifications = certificates.map((c, idx) => ({
        id: `cert-${idx + 1}`,
        courseName: c.courseName || "Course",
        courseId: c.cid,
        courseDescription: "Certificate issued for this course.",
        message: `Course Completed! Certificate issued for "${c.courseName || "Course"}"`,
        timestamp: c.issuedAt
          ? new Date(c.issuedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })
          : new Date().toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
        type: "certificate",
        level: undefined,
        chapters: undefined,
      }));

      setNotifications([...enrollmentNotifications, ...certificateNotifications]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Section header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-ev-on-surface">
          Notifications
        </h2>
        <div className="h-1 w-12 bg-ev-tertiary-fixed rounded-full glow-tertiary"></div>
      </div>

      {/* Notifications list */}
      <div className="space-y-4 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-ev-outline">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-ev-surface-container-lowest dark:bg-ev-surface-container rounded-xl p-6 hover:scale-[1.01] transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.type === "certificate"
                      ? "bg-ev-tertiary-fixed/20 text-ev-tertiary"
                      : "bg-ev-secondary-container text-primary"
                  }`}>
                    {notification.type === "certificate" ? (
                      <Award className="w-6 h-6" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h3 className="text-base font-bold text-ev-on-surface">
                      {notification.type === "certificate"
                        ? "Course Completed"
                        : "Course Enrollment"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-ev-outline">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{notification.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-ev-on-surface-variant mb-3 leading-relaxed text-sm">
                    {notification.message}
                  </p>

                  {/* Course detail card */}
                  <div className="bg-ev-surface-container-low dark:bg-ev-surface-container-high rounded-lg p-4">
                    <h4 className="font-bold text-ev-on-surface mb-2 text-sm">
                      {notification.courseName}
                    </h4>
                    <p className="text-xs text-ev-on-surface-variant mb-3">
                      {notification.courseDescription}
                    </p>
                    {notification.level && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-ev-outline">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          <span>Level: {notification.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-ev-tertiary-fixed rounded-full glow-tertiary"></span>
                          <span>{notification.chapters} chapters</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-ev-surface-container-high dark:bg-ev-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-ev-outline" />
            </div>
            <h3 className="text-lg font-bold text-ev-on-surface mb-2">
              No notifications yet
            </h3>
            <p className="text-ev-on-surface-variant mb-6">
              Enroll in courses to see your enrollment notifications here.
            </p>
            <a
              href="/workspace/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Explore Courses
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
