import { Gift } from "lucide-react";
import React from "react";

function ChapterTopicList({ course }) {
  const courseLayout = course?.courseJson?.course;
  return (
    <div>
      <h2 className="font-bold text-3xl mt-10 tracking-tight">
        Chapters & Topics
      </h2>

      <div className="flex flex-col items-center justify-center mt-10 w-full">
        {courseLayout?.chapters.map((chapter, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-full max-w-3xl group"
          >
            <div
              className="
            relative w-full
            p-5 md:p-6 border shadow-lg rounded-2xl
            bg-gradient-to-r from-primary to-primary/70 text-primary-foreground
            ring-1 ring-black/5
          "
            >
              <h2 className="text-center text-xs uppercase tracking-wider/relaxed opacity-90">
                Chapter {index + 1}
              </h2>
              <h2 className="font-bold text-lg md:text-xl text-center leading-snug mt-1">
                {chapter.chapterName}
              </h2>
              <h2
                className="
              mt-3 text-[11px] md:text-xs
              flex items-center justify-between gap-6 md:gap-10
              font-medium tracking-wide
              text-primary-foreground/90
            "
              >
                <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                  Duration: {chapter?.duration}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                  No. Of Chapters: {chapter?.topics?.length}
                </span>
              </h2>
            </div>

            <div className="w-full">
              {chapter?.topics.map((topic, index) => (
                <div className="flex flex-col items-center" key={index}>
                  <div className="h-8 md:h-10 bg-gradient-to-b from-border/80 to-transparent w-px"></div>

                  <div className="flex items-center gap-6 md:gap-8">
                    <span
                      className={`${
                        index % 2 == 0 &&
                        "text-transparent select-none pointer-events-none"
                      } max-w-xs text-sm md:text-base leading-snug text-muted-foreground bg-card/60 border px-3 py-2 rounded-lg shadow-sm`}
                    >
                      {topic}
                    </span>

                    <h2
                      className="
                    text-center rounded-full bg-card text-foreground/80
                    px-6 py-4 font-semibold
                    shadow-md ring-1 ring-border/60
                    transition-transform duration-200
                    group-hover:scale-[1.02]
                  "
                    >
                      {index + 1}
                    </h2>

                    <span
                      className={`${
                        index % 2 != 0 &&
                        "text-transparent select-none pointer-events-none"
                      } max-w-xs text-sm md:text-base leading-snug text-muted-foreground bg-card/60 border px-3 py-2 rounded-lg shadow-sm`}
                    >
                      {topic}
                    </span>
                  </div>

                  {index == chapter?.topics?.length - 1 && (
                    <div className="h-8 md:h-10 bg-gradient-to-b from-border/80 to-transparent w-px"></div>
                  )}

                  {index == chapter?.topics?.length - 1 && (
                    <div className="flex items-center gap-5">
                      <Gift className="text-center rounded-full h-14 w-14 p-4 text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 shadow-sm" />
                    </div>
                  )}

                  {index == chapter?.topics?.length - 1 && (
                    <div className="h-8 md:h-10 bg-gradient-to-b from-transparent to-border/80 w-px"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          className="
        mt-12 p-5 md:p-6 border shadow-xl rounded-2xl
        bg-gradient-to-r from-emerald-600 to-emerald-500 text-white
        ring-1 ring-black/5
      "
        >
          <h2 className="text-center font-semibold tracking-tight">Finish</h2>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;
