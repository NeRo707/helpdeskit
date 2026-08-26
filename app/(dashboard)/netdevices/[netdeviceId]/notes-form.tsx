"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateNetworkDevice } from "@/hooks/use-netdevices";

const NotesForm = ({
  entityId,
  currentNotes,
}: {
  entityId: string;
  currentNotes: string | null;
}) => {
  const [notes, setNotes] = useState(currentNotes ?? "");
  const updateDevice = useUpdateNetworkDevice(entityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateDevice.mutate(
      { notes },
      {
        onSuccess: () => {
          toast.success("Notes saved");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save notes");
        },
      }
    );
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
          disabled={updateDevice.isPending || notes === (currentNotes ?? "")}
        >
          <Save className="size-7" />
        </Button>
      </div>
    </form>
  );
};

export default NotesForm;
