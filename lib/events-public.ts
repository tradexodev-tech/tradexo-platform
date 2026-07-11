import type { EventFilters, EventSort } from "@/types/event";
import { DEFAULT_EVENT_FILTERS } from "@/types/event";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const VALID_SORTS: EventSort[] = [
  "newest",
  "oldest",
  "start_date_asc",
  "start_date_desc",
  "title",
];

const VALID_TIMEFRAMES: EventFilters["timeframe"][] = [
  "all",
  "upcoming",
  "past",
  "featured",
];

export function parseEventFilters(searchParams: SearchParams): EventFilters {
  const sortParam = getParam(searchParams.sort) as EventSort;
  const timeframeParam = getParam(searchParams.timeframe) as EventFilters["timeframe"];
  const page = Number(getParam(searchParams.page)) || 1;

  return {
    search: getParam(searchParams.q),
    industry: getParam(searchParams.industry),
    country: getParam(searchParams.country),
    city: getParam(searchParams.city),
    sort: VALID_SORTS.includes(sortParam) ? sortParam : DEFAULT_EVENT_FILTERS.sort,
    timeframe: VALID_TIMEFRAMES.includes(timeframeParam)
      ? timeframeParam
      : DEFAULT_EVENT_FILTERS.timeframe,
    page: page > 0 ? page : 1,
    pageSize: DEFAULT_EVENT_FILTERS.pageSize,
  };
}

export function buildEventQueryString(filters: Partial<EventFilters>): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("q", filters.search.trim());
  if (filters.industry?.trim()) params.set("industry", filters.industry.trim());
  if (filters.country?.trim()) params.set("country", filters.country.trim());
  if (filters.city?.trim()) params.set("city", filters.city.trim());
  if (filters.sort && filters.sort !== DEFAULT_EVENT_FILTERS.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.timeframe && filters.timeframe !== "all") {
    params.set("timeframe", filters.timeframe);
  }
  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
