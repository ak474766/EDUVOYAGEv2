import { NextResponse } from "next/server";

// JS file helpers
import {
  extractPdfText,
  extractDocxText,
  extractPlainText,
} from "../../../lib/files";

async function extractTextFromUploads(form) {
  let aggregate = "";
  for (const [key, value] of form.entries()) {
    if (value instanceof File) {
      const file = value;
      const buf = Buffer.from(await file.arrayBuffer());
      const name = file.name.toLowerCase();
      try {
        if (name.endsWith(".pdf")) {
          aggregate += "\n" + (await extractPdfText(buf));
        } else if (name.endsWith(".docx")) {
          aggregate += "\n" + (await extractDocxText(buf));
        } else if (name.endsWith(".txt")) {
          aggregate += "\n" + extractPlainText(buf);
        }
      } catch (e) {
        // ignore and continue
      }
    }
  }
  return aggregate.trim();
}

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const extracted = await extractTextFromUploads(form);

    return NextResponse.json({ success: true, text: extracted });
  } catch (error) {
    console.error("Extract text error:", error);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 },
    );
  }
}
