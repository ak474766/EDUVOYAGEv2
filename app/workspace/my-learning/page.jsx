import React from "react";
import WelcomeBanner from "../_components/WelcomeBanner";
import EnrollCourseList from "../_components/EnrollCourseList";

function MyLearning() {
  return (
    <div className="space-y-12">
      <WelcomeBanner />
      <EnrollCourseList />
    </div>
  );
}

export default MyLearning;
