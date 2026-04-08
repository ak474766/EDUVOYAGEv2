import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const CHAT_ENHANCEMENT_PROMPT = `You are an expert prompt enhancer improving career-related questions and queries to make them more specific, detailed, and actionable for an AI career advisor.

Your task is to enhance the given question by:
1. Adding relevant context and background information
2. Making the question more specific and detailed
3. Including relevant experience level or career stage
4. Adding specific goals or desired outcomes
5. Making it more professional and well-structured
6. Ensuring it's comprehensive enough for detailed career advice

Guidelines:
- Keep the original intent and core question
- Add professional context where helpful
- Make it 2-3 times more detailed
- Focus on career development, job search, skills, or professional growth
- Maintain a professional but conversational tone

Original question: 

Enhanced question should be more comprehensive and specific while maintaining the original intent.

Output: 1. Plain text format only, 2. Maximum 4-5 lines, 3. No markdown formatting, 4. Keep it conversational but professional`;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        {
          error: "missing_text",
          message: "Please provide a question to enhance.",
        },
        { status: 400 }
      );
    }

    const config = {
      responseMimeType: "text/plain",
    };
    const model = "gemini-2.5-flash-lite";

    // Create the enhancement prompt
    const enhancementPrompt = `${CHAT_ENHANCEMENT_PROMPT}\n\nOriginal question: ${text}`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: enhancementPrompt,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const enhancedText = response?.candidates[0]?.content?.parts[0]?.text;

    if (!enhancedText) {
      return NextResponse.json(
        {
          error: "enhancement_failed",
          message: "Failed to enhance the question. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      enhancedText: enhancedText.trim(),
    });
  } catch (error) {
    console.error("Chat enhancement error:", error);

    // Handle specific API key errors
    if (
      error.message?.includes("API_KEY") ||
      error.message?.includes("authentication")
    ) {
      return NextResponse.json(
        {
          error: "api_key_error",
          message:
            "API key is invalid or missing. Please check your configuration.",
        },
        { status: 500 }
      );
    }

    // Handle Gemini API errors
    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return NextResponse.json(
        {
          error: "quota_exceeded",
          message: "API quota exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Handle general AI service errors
    if (
      error.message?.includes("generateContent") ||
      error.message?.includes("model")
    ) {
      return NextResponse.json(
        {
          error: "ai_service_error",
          message:
            "AI service is currently unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "enhancement_failed",
        message: "Failed to enhance the question. Please try again.",
      },
      { status: 500 }
    );
  }
}
