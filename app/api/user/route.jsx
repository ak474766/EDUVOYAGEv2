import { db } from "../../../config/db";
import { usersTable } from "../../../config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  const { email, name } = await req.json();

  //if user already exist?
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  //If not then insert new user
  if (users?.length == 0) {
    const result = await db
      .insert(usersTable)
      .values({
        name: name,
        email: email,
      })
      .returning(usersTable);

    console.log(result);
    return NextResponse.json(result);
  }
  return NextResponse.json(users[0]);
}

// Get the current user's minimal profile with plan
export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    const dbUser = results?.[0];

    const name =
      dbUser?.name ?? [user.firstName, user.lastName].filter(Boolean).join(" ");

    // Get user's subscription from Clerk
    let subscriptionId = null;
    let plan = "Free";

    // Check if user has any subscription metadata directly from currentUser
    if (user && user.id) {
      // Check public metadata first
      if (user.publicMetadata?.subscriptionId) {
        subscriptionId = user.publicMetadata.subscriptionId;
        plan = "Premium";
      } else if (user.privateMetadata?.subscriptionStatus === "active") {
        subscriptionId = user.privateMetadata.subscriptionId || "premium";
        plan = "Premium";
      }
    }

    return NextResponse.json({ name, plan, subscriptionId });
  } catch (error) {
    console.error("GET /api/user error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
