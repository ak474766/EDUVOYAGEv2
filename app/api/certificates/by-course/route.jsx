import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../config/db";
import { certificatesTable } from "../../../../config/schema";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.primaryEmailAddress.emailAddress;
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId_required" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(certificatesTable)
      .where(
        and(
          eq(certificatesTable.userEmail, email),
          eq(certificatesTable.cid, courseId)
        )
      );
    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ certificateId: row.certificateId });
  } catch (e) {
    console.error("GET /api/certificates/by-course error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
