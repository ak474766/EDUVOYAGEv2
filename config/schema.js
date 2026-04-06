import {
  integer,
  pgTable,
  varchar,
  json,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId: varchar(),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar().notNull().unique(),
  name: varchar(),
  description: varchar(),
  noOfChapters: integer().notNull(),
  includeVideo: boolean().default(false),
  level: varchar().notNull(),
  catagory: varchar(),
  courseJson: json(),
  bannerImageUrl: varchar().default(""),
  courseContent: json().default({}),
  quizJSON: json(),
  userEmail: varchar("userEmail").references(() => usersTable.email),
});

export const enrollCourseTable = pgTable("enrollCourse", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  cid: varchar("cid").references(() => coursesTable.cid),
  userEmail: varchar("userEmail").references(() => usersTable.email),
  completedChapters: json(),
  enrolledAt: timestamp("enrolledAt").defaultNow(),
  quizScore: integer("quizScore"),
  quizCompleted: boolean("quizCompleted").default(false),
  userQuizAnswers: json("userQuizAnswers"),
  userQuizResults: json("userQuizResults"),
});

export const skillAnalysesTable = pgTable("skill_analyses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar().notNull(),
  input_meta: json(),
  result_json: json(),
  created_at: timestamp().defaultNow(),
});

// Certificates table
export const certificatesTable = pgTable("certificates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  certificateId: varchar({ length: 255 }).notNull().unique(),
  cid: varchar("cid").references(() => coursesTable.cid),
  userEmail: varchar("userEmail").references(() => usersTable.email),
  issuedAt: timestamp("issuedAt").defaultNow(),
});
