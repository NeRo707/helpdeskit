"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddAssetHistory } from "@/hooks/use-computers";

const AssetHistoryForm = ({ computerId }: { computerId: string }) => {
  const [action, setAction] = useState("");
  const addHistory = useAddAssetHistory(computerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;

    addHistory.mutate(
      { action },
      {
        onSuccess: () => {
          toast.success("History added");
          setAction("");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to add history"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex gap-2">
        <Textarea
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Describe the action (e.g., Repaired screen)..."
          rows={2}
          className="flex-1 h-24 bg-card!"
        />
        <Button
          className="w-24 h-24"
          type="submit"
          size="icon"
          disabled={addHistory.isPending || !action.trim()}
        >
          <Send className="size-7" />
        </Button>
      </div>
    </form>
  );
};

export default AssetHistoryForm;
