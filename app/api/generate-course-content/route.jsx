import { NextResponse } from "next/server";
import { ai } from "../../../lib/ai";
import axios from "axios";
import { db } from "../../../config/db";
import { coursesTable } from "../../../config/schema";
import { eq } from "drizzle-orm";
import { safeJsonParse } from "../../../lib/gemini";

const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
and give response in JSON format. 
Schema:{
chapterName:<>,
{
topic:<>,
content:<>
}
}
: User Input:
`;
export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    const promises = courseJson?.chapters?.map(async (chapter) => {
      const config = {};
      const model = "gemini-2.0-flash";
      const contents = [
        {
          role: "user",
          parts: [
            {
              text: PROMPT + JSON.stringify(chapter),
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });
      console.log(response.candidates?.[0]?.content?.parts?.[0]?.text);
      const RawResp =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const JSONResp = safeJsonParse(RawResp);

      //Get Youtube Videos
      const youtubeData = await GetYoutubeVideo(chapter?.chapterName);
      console.log({
        youtubeVideo: youtubeData,
        CourseData: JSONResp,
      });
      return {
        youtubeVideo: youtubeData,
        CourseData: JSONResp,
      };
    });

    const CourseContent = await Promise.all(promises);

    //Save to Data Base
    const dbResp = await db
      .update(coursesTable)
      .set({
        courseContent: CourseContent,
      })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      courseName: courseTitle,
      CourseContent: CourseContent,
    });
  } catch (error) {
    console.error("Error generating course content:", error);
    return NextResponse.json(
      { error: "Failed to generate course content" },
      { status: 500 }
    );
  }
}

const YOUTUBE_BSAE_URL = "https://www.googleapis.com/youtube/v3/search";
const GetYoutubeVideo = async (topic) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("YOUTUBE_API_KEY missing - skipping YouTube fetch");
      return [];
    }
    const params = {
      part: "snippet",
      q: topic,
      maxResults: 4,
      type: "video",
      key: apiKey, // Youtube API KEY
    };
    const resp = await axios.get(YOUTUBE_BSAE_URL, { params });
    const youtubeVideoListResp = resp.data.items || [];
    const youtubeVideoList = [];
    youtubeVideoListResp.forEach((item) => {
      const data = {
        videoId: item?.id?.videoId,
        title: item?.snippet?.title,
      };
      if (data.videoId && data.title) youtubeVideoList.push(data);
    });
    console.log("youtubeVideoList", youtubeVideoList);
    return youtubeVideoList;
  } catch (err) {
    console.error(
      "YouTube fetch failed:",
      err?.response?.data || err?.message || err
    );
    return [];
  }
};
