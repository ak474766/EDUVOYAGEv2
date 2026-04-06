import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { usersTable } from "../../../../config/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  // Handle subscription events
  if (
    eventType === "subscription.created" ||
    eventType === "subscription.updated" ||
    eventType === "subscription.past_due"
  ) {
    const { subscription, user } = evt.data;

    if (user?.email_addresses?.[0]?.email_address) {
      const email = user.email_addresses[0].email_address;
      const subscriptionId = subscription?.id || "premium";

      try {
        // Update user's subscriptionId in database
        await db
          .update(usersTable)
          .set({ subscriptionId: subscriptionId })
          .where(eq(usersTable.email, email));

        console.log(
          `Updated subscription for user ${email}: ${subscriptionId}`
        );
      } catch (error) {
        console.error("Error updating subscription in database:", error);
      }
    }
  }

  // Handle subscription cancellation
  if (eventType === "subscription.deleted") {
    const { subscription, user } = evt.data;

    if (user?.email_addresses?.[0]?.email_address) {
      const email = user.email_addresses[0].email_address;

      try {
        // Remove subscriptionId from database
        await db
          .update(usersTable)
          .set({ subscriptionId: null })
          .where(eq(usersTable.email, email));

        console.log(`Removed subscription for user ${email}`);
      } catch (error) {
        console.error("Error removing subscription from database:", error);
      }
    }
  }

  return NextResponse.json({ success: true });
}
