import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ENHANCEMENT_PROMPT = `You are a professional prompt enhancer. Your task is to improve the given text by making it more detailed, clear, and comprehensive while maintaining the original intent and meaning.

Guidelines for enhancement:
1. Add relevant context and details
2. Improve clarity and structure
3. Make it more specific and actionable
4. Maintain the original tone and purpose
5. Add professional terminology where appropriate
6. Ensure it's well-organized and easy to understand

Original text: 

Enhanced version should be 2-3 times more detailed while keeping the core message intact.

output:  1.plain text formate, 2.maximum of 3 lines output. 3.don't want this **""** type of output only plain text
`;

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { text, context } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        {
          error: "missing_text",
          message: "Please provide text to enhance.",
        },
        { status: 400 }
      );
    }

    const config = {
      responseMimeType: "text/plain",
    };
    const model = "gemini-2.5-flash-lite";

    // Create context-aware prompt
    const contextPrompt = context
      ? `${ENHANCEMENT_PROMPT}\n\nContext: ${context}\n\nOriginal text: ${text}`
      : `${ENHANCEMENT_PROMPT}\n\nOriginal text: ${text}`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: contextPrompt,
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
          message: "Failed to enhance the text. Please try again.",
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
    console.error("Prompt enhancement error:", error);

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
        message: "Failed to enhance the text. Please try again.",
      },
      { status: 500 }
    );
  }
}
