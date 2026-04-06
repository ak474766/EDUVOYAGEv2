"use client";
import { Button } from "../../../@/components/ui/button";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

function SubscriptionSync() {
  const [loading, setLoading] = useState(false);

  const syncSubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/sync-subscription");
      console.log("Sync response:", response.data);

      if (response.data.success) {
        toast.success(`Subscription synced! Plan: ${response.data.plan}`);
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        toast.error("Failed to sync subscription");
      }
    } catch (error) {
      console.error("Error syncing subscription:", error);
      toast.error("Error syncing subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Subscription Sync</h3>
      <p className="text-sm text-gray-600 mb-4">
        Manually sync your Clerk subscription data to the database
      </p>
      <Button
        onClick={syncSubscription}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Syncing..." : "Sync Subscription"}
      </Button>
    </div>
  );
}

export default SubscriptionSync;
