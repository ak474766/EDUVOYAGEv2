import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import {
  certificatesTable,
  coursesTable,
  usersTable,
} from "../../../../config/schema";

export async function GET(_req, context) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const certificateId = params?.certificate_id;
    if (!certificateId) {
      return NextResponse.json(
        { error: "certificateId_required" },
        { status: 400 }
      );
    }

    // Fetch certificate with joins
    const rows = await db
      .select({
        certificateId: certificatesTable.certificateId,
        issuedAt: certificatesTable.issuedAt,
        cid: certificatesTable.cid,
        courseJson: coursesTable.courseJson,
        courseName: coursesTable.name,
        courseCreatorEmail: coursesTable.userEmail,
        userEmail: certificatesTable.userEmail,
        dbUserName: usersTable.name,
      })
      .from(certificatesTable)
      .innerJoin(coursesTable, eq(certificatesTable.cid, coursesTable.cid))
      .innerJoin(usersTable, eq(certificatesTable.userEmail, usersTable.email))
      .where(eq(certificatesTable.certificateId, certificateId));

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Owner check
    const email = user.primaryEmailAddress.emailAddress;
    if (row.userEmail !== email) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    let courseCreatorName = "Course Founder";
    if (row.courseCreatorEmail) {
      const creatorRows = await db
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.email, row.courseCreatorEmail))
        .limit(1);
      if (creatorRows?.[0]?.name) {
        courseCreatorName = creatorRows[0].name;
      }
    }

    const derivedCourseName =
      row.courseJson?.course?.name || row.courseName || "Course";

    const name =
      row.dbUserName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ");

    return NextResponse.json({
      certificateId: row.certificateId,
      issuedAt: row.issuedAt,
      cid: row.cid,
      courseName: derivedCourseName,
      userName: name,
      courseCreatorName,
    });
  } catch (e) {
    console.error("GET /api/certificates/[id] error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
