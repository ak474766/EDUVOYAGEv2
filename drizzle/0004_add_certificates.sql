-- Create certificates table
CREATE TABLE IF NOT EXISTS "certificates" (
    "id" serial PRIMARY KEY,
    "certificateId" varchar(255) UNIQUE NOT NULL,
    "cid" varchar REFERENCES "courses" ("cid"),
    "userEmail" varchar REFERENCES "users" ("email"),
    "issuedAt" timestamp DEFAULT now()
);

-- Helpful index for lookups by user + course
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON "certificates" ("userEmail", "cid");


