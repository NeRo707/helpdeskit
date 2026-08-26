import type { TAssetDiff } from "@/types/api";

interface TimelineDiffProps {
  diff: TAssetDiff | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) return "-";
    return JSON.stringify(value);
  }
  const str = String(value);
  // Attempt date formatting
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime()) && str.includes("T")) {
    return parsed.toLocaleString();
  }
  return str;
}

export function TimelineDiff({ diff }: TimelineDiffProps) {
  if (!diff || Object.keys(diff).length === 0) return null;

  const entries = Object.entries(diff).filter(([field, v]) => {
    // Hide 'notes' field if the user doesn't want it
    if (field.toLowerCase() === "notes") return false;

    if (!v) return false;
    // Skip noise: fields where both sides are null/undefined
    if ((v.old ?? null) === null && (v.new ?? null) === null) return false;
    return "old" in v || "new" in v;
  });

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 rounded-md bg-muted p-2 text-xs space-y-1">
      {entries.map(([field, v]) => {
        const beforeVal = formatValue(v.old);
        const afterVal = formatValue(v.new);

        return (
          <p key={field}>
            <span className="font-medium">{field}</span>:{" "}
            <span className="text-muted-foreground">{beforeVal}</span>
            {" → "}
            <span>{afterVal}</span>
          </p>
        );
      })}
    </div>
  );
}
