import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import {
  certificatesTable,
  coursesTable,
  enrollCourseTable,
  usersTable,
} from "../../../../config/schema";
import { v4 as uuidv4 } from "uuid";

function safeCountCompleted(completedChapters) {
  try {
    if (!completedChapters) return 0;
    if (Array.isArray(completedChapters)) return completedChapters.length;
    if (typeof completedChapters === "object") {
      let count = 0;
      for (const key in completedChapters) {
        if (completedChapters[key]) count++;
      }
      return count;
    }
    return 0;
  } catch {
    return 0;
  }
}

function resolveTotalChapters(courseRow) {
  const noOfChapters = courseRow?.noOfChapters;
  const cj = courseRow?.courseJson || {};
  const nested = cj?.course || {};
  const chaptersFromJson = Array.isArray(cj?.chapters)
    ? cj.chapters.length
    : Array.isArray(nested?.chapters)
    ? nested.chapters.length
    : Number.isFinite(nested?.noOfChapters)
    ? nested.noOfChapters
    : undefined;
  return Number.isFinite(noOfChapters)
    ? noOfChapters
    : Number.isFinite(nested?.noOfChapters)
    ? nested.noOfChapters
    : Number.isFinite(chaptersFromJson)
    ? chaptersFromJson
    : 0;
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "courseId_required" }, { status: 400 });
    }

    const userEmail = user.primaryEmailAddress.emailAddress;

    // Enrollment lookup for current user
    const enrollRows = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.userEmail, userEmail),
          eq(enrollCourseTable.cid, courseId)
        )
      );

    const enrollment = enrollRows?.[0];
    if (!enrollment) {
      return NextResponse.json(
        {
          error: "not_enrolled",
          message: "You are not enrolled in this course.",
        },
        { status: 400 }
      );
    }

    // Get course row
    const courseRows = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId));
    const course = courseRows?.[0];
    if (!course) {
      return NextResponse.json({ error: "course_not_found" }, { status: 404 });
    }

    const totalChapters = resolveTotalChapters(course);
    const completedCount = safeCountCompleted(enrollment.completedChapters);
    const quizCompleted = !!enrollment.quizCompleted;

    if (!Number.isFinite(totalChapters) || totalChapters <= 0) {
      return NextResponse.json(
        {
          error: "not_eligible",
          message: "Course has no chapters configured.",
        },
        { status: 400 }
      );
    }

    if (!quizCompleted || completedCount < totalChapters) {
      return NextResponse.json(
        {
          error: "not_eligible",
          message: `You must complete all chapters (${completedCount}/${totalChapters}) and finish the quiz to get a certificate.`,
        },
        { status: 400 }
      );
    }

    // Idempotent: check existing certificate
    const existing = await db
      .select()
      .from(certificatesTable)
      .where(
        and(
          eq(certificatesTable.userEmail, userEmail),
          eq(certificatesTable.cid, courseId)
        )
      );
    if (existing?.length) {
      return NextResponse.json({ certificateId: existing[0].certificateId });
    }

    const certificateId = uuidv4();
    const inserted = await db
      .insert(certificatesTable)
      .values({ certificateId, cid: courseId, userEmail })
      .returning(certificatesTable);

    return NextResponse.json({
      certificateId: inserted?.[0]?.certificateId || certificateId,
    });
  } catch (e) {
    console.error("POST /api/certificates/issue error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
