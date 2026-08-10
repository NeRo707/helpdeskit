import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const SORT_FIELDS = ["title", "priority", "status", "createdAt"] as const;
const DIRECTIONS  = ["asc", "desc"] as const;

export const ticketParamsCache = createSearchParamsCache({
  status:   parseAsString.withDefault(""),
  priority: parseAsString.withDefault(""),
  sort:     parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
  dir:      parseAsStringLiteral(DIRECTIONS).withDefault("desc"),
});
