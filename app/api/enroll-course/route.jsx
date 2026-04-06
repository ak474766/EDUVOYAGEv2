import { coursesTable, enrollCourseTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../config/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { courseId } = await req.json();
  const user = await currentUser();

  //if course already enrolled
  const enrollCourses = await db
    .select()
    .from(enrollCourseTable)
    .where(
      and(
        eq(enrollCourseTable.userEmail, user?.primaryEmailAddress.emailAddress),
        eq(enrollCourseTable.cid, courseId)
      )
    );

  if (enrollCourses?.length == 0) {
    const result = await db
      .insert(enrollCourseTable)
      .values({
        cid: courseId,
        userEmail: user.primaryEmailAddress?.emailAddress,
      })
      .returning(enrollCourseTable);

    return NextResponse.json(result);
  }
  return NextResponse.json({ message: "Course already enrolled" });
}

export async function GET(req) {
  const User = await currentUser();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams?.get("courseId");

  if (courseId) {
    const result = await db
      .select()
      .from(coursesTable)
      .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
      .where(
        and(
          eq(
            enrollCourseTable.userEmail,
            User.primaryEmailAddress?.emailAddress
          ),
          eq(enrollCourseTable.cid, courseId)
        )
      );

    return NextResponse.json(result);
  } else {
    const result = await db
      .select()
      .from(coursesTable)
      .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
      .where(
        eq(enrollCourseTable.userEmail, User.primaryEmailAddress?.emailAddress)
      )
      .orderBy(desc(enrollCourseTable.enrolledAt));

    return NextResponse.json(result);
  }
}

export async function PUT(req) {
  const { completedChapter, courseId } = await req.json();
  const User = await currentUser();

  const result = await db
    .update(enrollCourseTable)
    .set({
      completedChapters: completedChapter,
    })
    .where(
      and(
        eq(enrollCourseTable.cid, courseId),
        eq(enrollCourseTable.userEmail, User?.primaryEmailAddress?.emailAddress)
      )
    )
    .returning(enrollCourseTable);

  return NextResponse.json(result);
}
