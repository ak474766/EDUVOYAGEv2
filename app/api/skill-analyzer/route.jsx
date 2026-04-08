import { NextResponse } from "next/server";
import { callGeminiJSON } from "../../../lib/geminiRest";
import { safeJsonParse } from "../../../lib/gemini";
// JS file helpers
import {
  extractPdfText,
  extractDocxText,
  extractPlainText,
} from "../../../lib/files";

const SYSTEM_PROMPT = `You are EduVoyage’s Skill Analyzer. Output strictly valid JSON only. Schema:
{
  "extractedSkills": [{"name":"string","category":"string","evidence":"string","confidence":0.0}],
  "proficiency": {"<skill>": {"score": 0, "band": "Beginner|Intermediate|Advanced"}},
  "skillGaps": [{"skill":"string","why":"string","how":"string"}],
  "roleFit": {"<role>": {"match": 0, "rationale":"string"}},
  "learningPath": [{"skill":"string","chapters": [{"title":"string","hours": number,"topics": ["string"],"youtubeQueries": ["string"]}]}],
  "summary": "string",
  "safety": {"warnings": ["string"]}
}
Do not include markdown fences or extra keys.`;

const userPrompt = (ctx) =>
  `Context:\n\nTarget roles: ${
    ctx.targets?.join(", ") || "(not specified)"
  }\nYears of experience: ${
    ctx.yoe ?? "(not specified)"
  }\nPreferred stack tags: ${
    ctx.stack?.join(", ") || "(not specified)"
  }\n\nTask:\nExtract skills with category and short evidence phrases. Assign proficiency 0–100 and band. Compute roleFit for targets with match score and justification. Identify top gaps with why/how and propose a 4–6 week learningPath with chapters, hours, and YouTube search queries.\nConstraints: JSON only. No markdown. No extra keys. Keep arrays under 30 items. Proceed best‑effort.\n\nInput:\n${
    ctx.text
  }`;

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
    if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not set" },
        { status: 400 },
      );
    }
    const contentType = req.headers.get("content-type") || "";
    let text = "";
    let targets;
    let stack;
    let yoe;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const textRaw = form.get("text");
      const targetsRaw = form.get("targets");
      const stackRaw = form.get("stack");
      const yoeRaw = form.get("yoe");
      const textFromForm = typeof textRaw === "string" ? textRaw : "";
      targets =
        typeof targetsRaw === "string"
          ? targetsRaw.split(",").filter(Boolean)
          : undefined;
      stack =
        typeof stackRaw === "string"
          ? stackRaw.split(",").filter(Boolean)
          : undefined;
      yoe = typeof yoeRaw === "string" ? yoeRaw : undefined;
      let extracted = "";
      try {
        extracted = await extractTextFromUploads(form);
      } catch (err) {
        console.error("Extraction error:", err);
      }
      // If both pasted text and extracted text are empty, return a clear error
      if (!textFromForm.trim() && !extracted.trim()) {
        return NextResponse.json(
          {
            error:
              "Could not read PDF/DOCX/TXT text. Paste text or upload images instead.",
            hint: "Install pdf-parse/mammoth, or switch to Paste Text / Upload Image tabs.",
          },
          { status: 400 },
        );
      }
      text = [textFromForm, extracted].filter(Boolean).join("\n\n");
    } else {
      const body = await req.json();
      text = body?.text || "";
      targets = body?.targets;
      stack = body?.stack;
      yoe = body?.yoe;
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({
        extractedSkills: [],
        proficiency: {},
        skillGaps: [],
        roleFit: {},
        learningPath: [],
        summary: "",
        safety: { warnings: ["Empty or too little input text."] },
      });
    }

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "user",
        parts: [{ text: userPrompt({ targets, yoe, stack, text }) }],
      },
    ];
    const raw = await callGeminiJSON({ contents });
    try {
      const json = safeJsonParse(raw);
      return NextResponse.json(json);
    } catch (e) {
      // retry strict
      const retryContents = [
        {
          role: "user",
          parts: [
            {
              text:
                SYSTEM_PROMPT +
                "\nRespond strictly in JSON only matching this schema.",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: userPrompt({ targets, yoe, stack, text }) }],
        },
      ];
      const retryRaw = await callGeminiJSON({ contents: retryContents });
      const json = safeJsonParse(retryRaw);
      return NextResponse.json(json);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "Failed",
        hint: "Check GEMINI_API_KEY and that your model name is available. Also ensure input has at least ~10 characters.",
      },
      { status: 500 },
    );
  }
}
