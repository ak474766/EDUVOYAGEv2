export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { callGeminiJSON } from "../../../../lib/geminiRest";
import { safeJsonParse } from "../../../../lib/gemini";
import { bufferToBase64, getMimeFromFilename } from "../../../../lib/files";
import {
  bufferToBase64 as b64js,
  getMimeFromFilename as mimeJs,
} from "../../../../lib/files.js";

const SYSTEM_PROMPT = `You are EduVoyage’s Skill Analyzer. Output strictly valid JSON only following this schema:
{
  "extractedSkills": [{"name":"string","category":"string","evidence":"string","confidence":0.0}],
  "proficiency": {"<skill>": {"score": 0, "band": "Beginner|Intermediate|Advanced"}},
  "skillGaps": [{"skill":"string","why":"string","how":"string"}],
  "roleFit": {"<role>": {"match": 0, "rationale":"string"}},
  "learningPath": [{"skill":"string","chapters": [{"title":"string","hours": number,"topics": ["string"],"youtubeQueries": ["string"]}]}],
  "summary": "string",
  "safety": {"warnings": ["string"]}
}`;

const userPrompt = (ctx) =>
  `Context:\n\nTarget roles: ${
    ctx.targets?.join(", ") || "(not specified)"
  }\nYears of experience: ${
    ctx.yoe ?? "(not specified)"
  }\nPreferred stack tags: ${
    ctx.stack?.join(", ") || "(not specified)"
  }\nTask: Analyze the attached resume/portfolio images (and optional text) to produce the JSON strictly per schema.`;

export async function POST(req) {
  try {
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GOOGLE_API_KEY is not set",
          hint: "Add GOOGLE_API_KEY to your .env and restart the server",
        },
        { status: 400 }
      );
    }
    const form = await req.formData();
    const textVal = form.get("text");
    const targetsVal = form.get("targets");
    const stackVal = form.get("stack");
    const yoeVal = form.get("yoe");
    const text = typeof textVal === "string" ? textVal : "";
    const targets =
      typeof targetsVal === "string"
        ? targetsVal.split(",").filter(Boolean)
        : [];
    const stack =
      typeof stackVal === "string" ? stackVal.split(",").filter(Boolean) : [];
    const yoe = typeof yoeVal === "string" ? yoeVal : undefined;

    const images = [];
    let count = 0;
    for (const [key, value] of form.entries()) {
      if (value instanceof File && count < 5) {
        const file = value;
        const arrayBuf = await file.arrayBuffer();
        const baseSource = Buffer.from(arrayBuf);
        const base64 = bufferToBase64
          ? bufferToBase64(baseSource)
          : b64js(baseSource);
        const mimeType =
          file.type ||
          (getMimeFromFilename
            ? getMimeFromFilename(file.name)
            : mimeJs(file.name));
        images.push({ inlineData: { data: base64, mimeType } });
        count++;
      }
    }

    if (images.length === 0) {
      // If user provided text, analyze as text-only instead of erroring
      if (text && text.trim().length >= 10) {
        const contents = [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          {
            role: "user",
            parts: [
              {
                text:
                  userPrompt({ targets, yoe, stack, text }) +
                  `\n\nInput (text only)\n${text}`,
              },
            ],
          },
        ];
        const raw = await callGeminiJSON({ contents });
        const json = safeJsonParse(raw);
        return NextResponse.json(json);
      }
      return NextResponse.json(
        {
          error: "No images uploaded",
          hint: "Attach 1–5 JPG/PNG images or paste text. PDFs require parser deps.",
        },
        { status: 400 }
      );
    }

    const parts = [
      { text: SYSTEM_PROMPT },
      ...images,
      {
        text:
          userPrompt({ targets, yoe, stack, text }) +
          (text ? `\n\nAdditional text:\n${text}` : ""),
      },
    ];
    const raw = await callGeminiJSON({ contents: [{ role: "user", parts }] });
    try {
      const json = safeJsonParse(raw);
      return NextResponse.json(json);
    } catch (e) {
      const retryRaw = await callGeminiJSON({
        contents: [
          {
            role: "user",
            parts: [
              { text: SYSTEM_PROMPT + "\nRespond strictly in JSON." },
              ...images,
              { text: userPrompt({ targets, yoe, stack, text }) },
            ],
          },
        ],
      });
      const json = safeJsonParse(retryRaw);
      return NextResponse.json(json);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "Failed",
        hint: "Verify GOOGLE_API_KEY, model availability, and that images are under 10MB and of type jpg/png.",
      },
      { status: 500 }
    );
  }
}
