import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "../../../config/db";
import { certificatesTable, coursesTable } from "../../../config/schema";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;

    const rows = await db
      .select({
        certificateId: certificatesTable.certificateId,
        issuedAt: certificatesTable.issuedAt,
        cid: certificatesTable.cid,
        courseName: coursesTable.name,
      })
      .from(certificatesTable)
      .innerJoin(coursesTable, eq(certificatesTable.cid, coursesTable.cid))
      .where(eq(certificatesTable.userEmail, email));

    return NextResponse.json(rows || []);
  } catch (e) {
    console.error("GET /api/certificates error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
