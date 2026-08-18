import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const SORT_FIELDS = ["title", "priority", "status", "createdAt", "assigned"] as const;
const DIRECTIONS  = ["asc", "desc"] as const;
const SEARCH_FIELDS = ["title", "reporter", "assigned"] as const;

export const ticketParamsCache = createSearchParamsCache({
  status:   parseAsString.withDefault(""),
  priority: parseAsString.withDefault(""),
  sort:     parseAsStringLiteral(SORT_FIELDS).withDefault("createdAt"),
  dir:      parseAsStringLiteral(DIRECTIONS).withDefault("desc"),
  by:       parseAsStringLiteral(SEARCH_FIELDS).withDefault("title"),
  q:        parseAsString.withDefault(""),
});
