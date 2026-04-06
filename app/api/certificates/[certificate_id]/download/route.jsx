import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../config/db";
import { certificatesTable } from "../../../../../config/schema";

export async function GET(_req, { params }) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificateId = params?.certificate_id;
    if (!certificateId) {
      return NextResponse.json(
        { error: "certificateId_required" },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(certificatesTable)
      .where(eq(certificatesTable.certificateId, certificateId));
    const row = rows?.[0];
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const email = user.primaryEmailAddress.emailAddress;
    if (row.userEmail !== email) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // For now, redirect to client-side print page for PDF generation
    const location = `/certificates/${encodeURIComponent(certificateId)}/print`;
    return new NextResponse(null, {
      status: 302,
      headers: { Location: location },
    });
  } catch (e) {
    console.error("GET /api/certificates/[id]/download error", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
