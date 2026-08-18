"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TNetworkDevice } from "@/types/api";

const NotesForm = ({
  buildingId,
  roomId,
  entityId,
  currentNotes,
}: {
  buildingId: string;
  roomId: string;
  entityId: string;
  currentNotes: string | null;
}) => {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await await fetch(`/api/buildings/${buildingId}/rooms/${roomId}/netdevices/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save notes");
      }

      toast.success("Notes saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex gap-2">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="flex-1 h-24 bg-card!"
        />
        <Button
          className="w-24 h-24"
          type="submit"
          size="icon"
          disabled={loading || notes === (currentNotes ?? "")}
        >
          <Save className="size-7" />
        </Button>
      </div>
    </form>
  );
};

export default NotesForm;
