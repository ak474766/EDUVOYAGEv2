import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Create a SQL connection with Neon
const sql = neon(process.env.DATABASE_URL);

// Create a Drizzle ORM instance using the SQL connection
export const db = drizzle(sql);
