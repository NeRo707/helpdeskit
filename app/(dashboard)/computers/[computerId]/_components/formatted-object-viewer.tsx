import { Badge } from "@/components/ui/badge";

interface FormattedObjectViewerProps {
  data: Record<string, unknown> | null | undefined;
  isNested?: boolean;
}

export function FormattedObjectViewer({ data, isNested = false }: FormattedObjectViewerProps) {
  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return <p className="text-muted-foreground italic">No data available</p>;
  }

  // Filter out the "Computer" relational object
  const entries = Object.entries(data).filter(
    ([key]) => key.toLowerCase() !== "computer"
  );

  if (entries.length === 0) {
    return <p className="text-muted-foreground italic">No data available</p>;
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 ${
        !isNested ? "rounded-md bg-muted/50 p-3" : ""
      }`}
    >
      {entries.map(([key, value]) => {
        let displayValue: React.ReactNode;
        let spanFull = false;

        if (value === null || value === undefined || value === "") {
          displayValue = <span className="text-muted-foreground">-</span>;
        } else if (typeof value === "boolean") {
          displayValue = (
            <Badge variant={value ? "outline" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
              {value ? "True" : "False"}
            </Badge>
          );
        } else if (
          (key.endsWith("At") || key.toLowerCase().includes("date")) &&
          typeof value === "string" &&
          !isNaN(Date.parse(value))
        ) {
          displayValue = new Date(value).toLocaleString();
        } else if (Array.isArray(value)) {
          spanFull = value.length > 0;
          displayValue = value.length === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              {value.map((item, idx) => (
                <div key={idx} className="rounded-md border bg-background/50 p-2">
                  {typeof item === "object" && item !== null ? (
                    <FormattedObjectViewer data={item as Record<string, unknown>} isNested />
                  ) : (
                    String(item)
                  )}
                </div>
              ))}
            </div>
          );
        } else if (typeof value === "object") {
          spanFull = true;
          displayValue = (
            <div className="mt-1 rounded-md border bg-background/50 p-2">
              <FormattedObjectViewer data={value as Record<string, unknown>} isNested />
            </div>
          );
        } else {
          displayValue = String(value);
        }

        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();

        return (
          <div key={key} className={`flex flex-col text-xs ${spanFull ? "col-span-full" : ""}`}>
            <span className="font-semibold text-muted-foreground text-[11px]">{formattedKey}</span>
            <div className="break-words font-medium">{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
}
