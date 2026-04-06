-- Add quizJSON to courses and quizScore + quizCompleted to enrollCourse
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "quizJSON" json;
ALTER TABLE "enrollCourse" ADD COLUMN IF NOT EXISTS "quizScore" integer;
ALTER TABLE "enrollCourse" ADD COLUMN IF NOT EXISTS "quizCompleted" boolean DEFAULT false;
