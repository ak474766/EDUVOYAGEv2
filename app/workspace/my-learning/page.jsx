import React from "react";
import WelcomeBanner from "../_components/WelcomeBanner";
import EnrollCourseList from "../_components/EnrollCourseList";

function MyLearning() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-8">
          <WelcomeBanner />
        </div>
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl p-6 sm:p-8">
          <EnrollCourseList />
        </div>
      </div>
    </div>
  );
}

export default MyLearning;
