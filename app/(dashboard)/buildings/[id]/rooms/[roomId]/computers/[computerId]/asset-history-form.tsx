"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const AssetHistoryForm = ({ computerId }: { computerId: string }) => {
  const router = useRouter();
  // Renamed 'body' to 'action' to match backend requirements
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/computers/${computerId}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending 'action' now matches your API validation rules
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add comment");
      }

      toast.success("History added");
      setAction("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex gap-2 ">
        <Textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Describe the action (e.g., Repaired screen)..."
          rows={2}
          className="flex-1 bg-card h-24"
        />
        <Button type="submit" size="icon" disabled={loading || !action.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default AssetHistoryForm;
