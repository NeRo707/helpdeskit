interface TimelineDiffProps {
  diff: Record<string, unknown> | null;
}

export function TimelineDiff({ diff }: TimelineDiffProps) {
  if (!diff || Object.keys(diff).length === 0) return null;

  const entries = Object.entries(diff).filter(([, value]) => {
    if (!value || typeof value !== "object") return false;
    const typedValue = value as {
      before?: unknown;
      old?: unknown;
      after?: unknown;
      new?: unknown;
    };
    return "before" in typedValue || "old" in typedValue || "after" in typedValue || "new" in typedValue;
  });

  if (entries.length === 0) {
    return (
      <div className="mt-2 rounded-md bg-muted p-2 text-xs">
        <pre className="whitespace-pre-wrap">{JSON.stringify(diff, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-md bg-muted p-2 text-xs space-y-1">
      {entries.map(([field, value]) => {
        const typedValue = value as { before?: string; old?: string; after?: string; new?: string };
        const beforeVal = typedValue.before ?? typedValue.old;
        const afterVal = typedValue.after ?? typedValue.new;

        const formatDate = (value?: string) => {
          if (!value) return "-";
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
        };

        return (
          <p key={field}>
            <span className="font-medium">{field}</span>:{" "}
            {field === "UpdatedAt" ? (
              <>
                {formatDate(beforeVal)} → {formatDate(afterVal)}
              </>
            ) : (
              <>
                {beforeVal ?? "-"} → {afterVal ?? "-"}
              </>
            )}
          </p>
        );
      })}
    </div>
  );
}
