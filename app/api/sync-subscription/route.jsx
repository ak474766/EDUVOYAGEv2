import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../../../config/db";
import { usersTable } from "../../../config/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;
    let subscriptionId = null;
    let plan = "Free";

    // Try to get subscription information from Clerk
    try {
      const clerkUser = await clerkClient.users.getUser(user.id);

      // Check various possible locations for subscription data
      if (clerkUser.publicMetadata?.subscriptionId) {
        subscriptionId = clerkUser.publicMetadata.subscriptionId;
        plan = "Premium";
      } else if (clerkUser.privateMetadata?.subscriptionStatus === "active") {
        subscriptionId = clerkUser.privateMetadata.subscriptionId || "premium";
        plan = "Premium";
      } else if (clerkUser.publicMetadata?.subscriptionStatus === "active") {
        subscriptionId = clerkUser.publicMetadata.subscriptionId || "premium";
        plan = "Premium";
      }

      // You can also check for specific subscription fields based on your Clerk setup
      // For example, if you're using Clerk's billing features
      if (clerkUser.publicMetadata?.hasActiveSubscription) {
        subscriptionId = "premium";
        plan = "Premium";
      }
    } catch (subscriptionError) {
      console.log(
        "Could not fetch subscription info from Clerk:",
        subscriptionError
      );
    }

    // Update the user's subscriptionId in the database
    await db
      .update(usersTable)
      .set({ subscriptionId: subscriptionId })
      .where(eq(usersTable.email, email));

    return NextResponse.json({
      success: true,
      subscriptionId,
      plan,
      message: "Subscription data synced successfully",
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
