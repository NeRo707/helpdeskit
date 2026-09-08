import { useTickets } from "@/hooks/use-tickets";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

export const SORT_FIELDS = [
  "title",
  "priority",
  "status",
  "createdAt",
  "assigned",
] as const;
const DIRECTIONS = ["asc", "desc"] as const;
const SEARCH_FIELDS = ["title", "reporter", "assigned"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const COLUMNS: { id: string; label: string; sortable: boolean }[] = [
  { id: "title", label: "Title", sortable: true },
  { id: "priority", label: "Priority", sortable: true },
  { id: "status", label: "Status", sortable: true },
  { id: "reportedBy", label: "Reporter", sortable: false },
  { id: "assigned", label: "Assigned", sortable: true },
  { id: "createdAt", label: "Created", sortable: true },
];

export function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (state === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
}

export const useSearchForm = () => {
  const [params, setParams] = useQueryStates(
    {
      status: parseAsString.withDefault(""),
      priority: parseAsString.withDefault(""),
      sort: parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
      dir: parseAsStringLiteral(DIRECTIONS).withDefault("desc"),
      by: parseAsStringLiteral(SEARCH_FIELDS).withDefault("title"),
      q: parseAsString.withDefault(""),
    },
    { shallow: false },
  );

  const handleSort = (colId: SortField) => {
    if (params.sort !== colId) {
      // first click on a new column → descending
      setParams({ sort: colId, dir: "desc" });
    } else if (params.dir === "desc") {
      // second click on same column → ascending
      setParams({ sort: colId, dir: "asc" });
    } else {
      // third click → back to unsorted (default state)
      setParams({ sort: null, dir: null });
    }
  };

  // React Query re-fetches whenever params change (new query key)
  const { data: tickets, isPending, isError } = useTickets(params);

  return { params, setParams, handleSort, tickets, isPending, isError };
};
