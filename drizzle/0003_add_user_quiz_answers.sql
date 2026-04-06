-- Add user answers and per-question results for quiz persistence
ALTER TABLE "enrollCourse" ADD COLUMN IF NOT EXISTS "userQuizAnswers" json;
ALTER TABLE "enrollCourse" ADD COLUMN IF NOT EXISTS "userQuizResults" json;
