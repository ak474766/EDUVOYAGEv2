"use client";
import React, { useEffect, useState } from "react";
import { Bell, Calendar, BookOpen } from "lucide-react";
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
          message: `🎉 Congratulations! You've successfully enrolled in "${
            enrollment.courses?.name || "Course"
          }"`,
          timestamp: enrollment.enrollCourse?.enrolledAt
            ? new Date(enrollment.enrollCourse.enrolledAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
        message: `🏅 Course Completed! Certificate issued for "${
          c.courseName || "Course"
        }"`,
        timestamp: c.issuedAt
          ? new Date(c.issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
        type: "certificate",
        level: undefined,
        chapters: undefined,
      }));

      const all = [...enrollmentNotifications, ...certificateNotifications];
      setNotifications(all);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-6">
      <div className="max-w-4xl mx-auto bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-500/15 rounded-lg">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Your course enrollment notifications
              </p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Course Enrollment
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{notification.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed text-sm sm:text-base">
                      {notification.message}
                    </p>

                    {/* Course Details */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 sm:p-4 border border-gray-200/60 dark:border-white/10">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                        {notification.courseName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {notification.courseDescription}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Level: {notification.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>{notification.chapters} chapters</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Enroll in courses to see your enrollment notifications here.
              </p>
              <a
                href="/workspace/explore"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Explore Courses
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
