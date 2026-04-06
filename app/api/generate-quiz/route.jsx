import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { coursesTable } from "../../../config/schema";
import { and, eq } from "drizzle-orm";
import { callGeminiJSON } from "../../../lib/geminiRest";
import { safeJsonParse } from "../../../lib/gemini";

const systemPrompt = (course) => `You are an expert course quiz generator.
Generate exactly 10 multiple-choice questions based on the provided course content. Each question must have 4 options and exactly one correct answer.
Return ONLY valid JSON with the following schema:
{
  "quizzes": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number, // 0-3
      "explanation": string // why the correct option is correct in 2-3 sentences
    }
  ]
}
Guidelines:
- Use terminology appearing in the course.
- Avoid trivial recall; test meaningful understanding.
- Ensure options are plausible and not trivial.
- Do not include any commentary outside JSON.
`;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.cid, courseId));
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ quizJSON: course.quizJSON || null });
}

export async function POST(req) {
  const { courseId } = await req.json();
  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.cid, courseId));
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  if (
    course.quizJSON &&
    course.quizJSON.quizzes &&
    course.quizJSON.quizzes.length
  ) {
    // Already generated
    return NextResponse.json({ quizJSON: course.quizJSON, created: false });
  }

  const contentForQuiz = course.courseJson || course.courseContent || {};
  try {
    // Proactive key check to avoid 500s
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "missing_api_key",
          message: "Gemini API key is not configured on the server.",
        },
        { status: 400 }
      );
    }
    const contents = [
      { role: "user", parts: [{ text: systemPrompt(course) }] },
      {
        role: "user",
        parts: [
          { text: JSON.stringify({ course: contentForQuiz }).slice(0, 120000) },
        ],
      },
    ];
    const text = await callGeminiJSON({ contents, apiKey });
    const json = safeJsonParse(text);
    // Basic validation
    if (!json || !Array.isArray(json.quizzes) || json.quizzes.length !== 10) {
      return NextResponse.json(
        { error: "Invalid quiz format returned" },
        { status: 502 }
      );
    }

    const [updated] = await db
      .update(coursesTable)
      .set({ quizJSON: json })
      .where(eq(coursesTable.cid, courseId))
      .returning({ quizJSON: coursesTable.quizJSON });

    return NextResponse.json({
      quizJSON: updated?.quizJSON || json,
      created: true,
    });
  } catch (e) {
    console.error("Quiz generation failed", e);
    return NextResponse.json(
      { error: "Quiz generation failed" },
      { status: 500 }
    );
  }
}
