import { db } from "../../../config/db";

import { coursesTable, usersTable } from "../../../config/schema";
import { eq } from "drizzle-orm";

import { auth, currentUser } from "@clerk/nextjs/server";
import { ai } from "../../../lib/ai";
import { NextResponse } from "next/server";
import axios from "axios";
import { clerkClient } from "@clerk/nextjs/server";
const PROMPT = `generate Learning Course depends on following details. In which Make sure to add Course Name, Description,Course Banner Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (The palette is rooted in nature, using desaturated greens for stability and vibrant neon for "pulse" points) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format Chapter Name, , Topic under each chapters , Duration for each chapters etc, in JSON format only

Schema:

{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",

"bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ],
     
      }
    ]
  }
}

, User Input: 

`;

export async function POST(req) {
  const { courseId, ...formData } = await req.json();
  const user = await currentUser();
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: "starter" });

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = user.primaryEmailAddress.emailAddress;

  // Check subscription status
  let isSubscribed = false;
  try {
    if (user && user.id) {
      const client = await clerkClient();
      const userSubscriptions = await client.users.getUser(user.id);
      if (
        userSubscriptions.publicMetadata?.subscriptionId ||
        userSubscriptions.privateMetadata?.subscriptionStatus === "active"
      ) {
        isSubscribed = true;
      }
    }
  } catch (error) {
    console.log("Could not fetch subscription info:", error);
  }

  // Check course count for non-subscribers
  let warningPayload = null; // carry warning without early return
  if (!isSubscribed && !hasPremiumAccess) {
    const existingCourses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, userEmail));

    const courseCount = existingCourses.length;
    const maxFreeCourses = 5;

    if (courseCount >= maxFreeCourses) {
      return NextResponse.json({
        error: "limit_exceeded",
        message:
          "You have reached the maximum limit of 5 courses for free users. Please subscribe to generate unlimited courses.",
        coursesLeft: 0,
        totalCourses: courseCount,
      });
    }

    // Capture remaining courses info for free users as a warning
    const coursesLeft = maxFreeCourses - courseCount;
    if (coursesLeft <= 2) {
      warningPayload = {
        error: "warning",
        message: `You have ${coursesLeft} course${
          coursesLeft === 1 ? "" : "s"
        } left. Consider subscribing for unlimited courses.`,
        coursesLeft,
        totalCourses: courseCount,
      };
    }
  }

  const config = {
    responseMimeType: "text/plain",
  };
  const model = "gemini-2.5-flash-lite";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: PROMPT + JSON.stringify(formData),
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    console.log(response.candidates[0].content.parts[0].text);
    const RawResp = response?.candidates[0]?.content?.parts[0]?.text;
    const RawJson = RawResp.replace(/```json|```/g, "");
    const JSONResp = JSON.parse(RawJson);

    const ImagePrompt = JSONResp.course?.bannerImagePrompt;
    //generate Images
    const bannerImageUrl = await GenerateImage(ImagePrompt);

    //Save to DataBase
    // Check if user exists in the usersTable
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userEmail));

    // If user does not exist, insert them
    if (existingUser.length === 0) {
      await db.insert(usersTable).values({
        email: userEmail,
        name: user?.fullName || "Anonymous",
      });
    }

    const result = await db.insert(coursesTable).values({
      ...formData,
      courseJson: JSONResp,
      userEmail: userEmail,
      cid: courseId,
      bannerImageUrl: bannerImageUrl,
    });

    // Get updated course count for response
    const updatedCourses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, userEmail));

    const successMessage =
      isSubscribed || hasPremiumAccess
        ? "Course generated successfully! You have unlimited course generation."
        : `Course generated successfully! You have ${
            5 - updatedCourses.length
          } course${5 - updatedCourses.length === 1 ? "" : "s"} left.`;

    // Build response and merge non-blocking warning (if any)
    const baseResponse = {
      courseId: courseId,
      message: successMessage,
      coursesLeft:
        isSubscribed || hasPremiumAccess
          ? "unlimited"
          : 5 - updatedCourses.length,
      totalCourses: updatedCourses.length,
    };

    return NextResponse.json(
      warningPayload ? { ...baseResponse, ...warningPayload } : baseResponse
    );
  } catch (error) {
    console.error("Course generation error:", error);

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
        error: "generation_failed",
        message: "Failed to generate course. Please try again.",
      },
      { status: 500 }
    );
  }
}

const GenerateImage = async (imagePrompt) => {
  try {
    const BASE_URL = "https://aigurulab.tech";
    const result = await axios.post(
      BASE_URL + "/api/generate-image",
      {
        width: 1024,
        height: 1024,
        input: imagePrompt,
        model: "flux", //'flux'
        aspectRatio: "16:9", //Applicable to Flux model only
      },
      {
        headers: {
          "x-api-key": process?.env?.AI_GURU_LAB_API_KEY, // Your API Key
          "Content-Type": "application/json", // Content Type
        },
      }
    );
    console.log(result.data.image); //Output Result: Base 64 Image
    return result.data.image;
  } catch (error) {
    console.error("Image generation error:", error);
    // Return a placeholder or default image URL if image generation fails
    return "https://via.placeholder.com/1024x1024?text=Course+Banner";
  }
};
