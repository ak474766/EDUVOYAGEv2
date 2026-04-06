import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import { enrollCourseTable } from "../../../../config/schema";

export async function PUT(req) {
  const { courseId, score, completed, userQuizAnswers, userQuizResults } = await req.json();
  const user = await currentUser();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const [updated] = await db
    .update(enrollCourseTable)
    .set({
      quizScore: Number(score) ?? null,
      quizCompleted: !!completed,
      userQuizAnswers: userQuizAnswers ?? null,
      userQuizResults: userQuizResults ?? null,
    })
    .where(
      and(
        eq(enrollCourseTable.cid, courseId),
        eq(enrollCourseTable.userEmail, user?.primaryEmailAddress?.emailAddress)
      )
    )
    .returning({
      quizScore: enrollCourseTable.quizScore,
      quizCompleted: enrollCourseTable.quizCompleted,
      userQuizAnswers: enrollCourseTable.userQuizAnswers,
      userQuizResults: enrollCourseTable.userQuizResults,
    });

  return NextResponse.json(updated || { quizScore: score ?? null, quizCompleted: !!completed });
}
