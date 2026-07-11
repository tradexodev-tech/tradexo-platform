"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchPublicEvents } from "@/lib/events";
import { buildEventQueryString } from "@/lib/events-public";
import type { Event, EventFilters, EventSort } from "@/types/event";
import { DEFAULT_EVENT_FILTERS } from "@/types/event";

export const PUBLIC_EVENT_PAGE_SIZE = 12;

export type PublicEventFilters = Required<
  Pick<EventFilters, "search" | "industry" | "country" | "city" | "sort" | "timeframe" | "page" | "pageSize">
>;

export const DEFAULT_PUBLIC_EVENT_FILTERS: PublicEventFilters = {
  search: "",
  industry: "",
  country: "",
  city: "",
  sort: DEFAULT_EVENT_FILTERS.sort ?? "start_date_asc",
  timeframe: "all",
  page: 1,
  pageSize: PUBLIC_EVENT_PAGE_SIZE,
};

export function usePublicEvents(initialEvents?: Event[], initialCount?: number) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>(initialEvents ?? []);
  const [totalCount, setTotalCount] = useState(initialCount ?? 0);
  const [loading, setLoading] = useState(!initialEvents);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filters = useMemo<PublicEventFilters>(() => ({
    search: searchParams.get("q") ?? "",
    industry: searchParams.get("industry") ?? "",
    country: searchParams.get("country") ?? "",
    city: searchParams.get("city") ?? "",
    sort: (searchParams.get("sort") as EventSort) || DEFAULT_PUBLIC_EVENT_FILTERS.sort,
    timeframe: (searchParams.get("timeframe") as PublicEventFilters["timeframe"]) || "all",
    page: Number(searchParams.get("page")) || 1,
    pageSize: PUBLIC_EVENT_PAGE_SIZE,
  }), [searchParams]);

  const [searchInput, setSearchInput] = useState(filters.search);
  const appliedSearchRef = useRef(filters.search);

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.industry ||
    filters.country ||
    filters.city ||
    filters.timeframe !== "all" ||
    filters.sort !== DEFAULT_PUBLIC_EVENT_FILTERS.sort
  );

  const setFilters = useCallback(
    (partial: Partial<PublicEventFilters>) => {
      const next = { ...filters, ...partial, page: partial.page ?? 1 };
      const query = buildEventQueryString(next);
      router.push(`/events${query}`);
    },
    [filters, router]
  );

  useEffect(() => {
    setSearchInput(filters.search);
    appliedSearchRef.current = filters.search;
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === appliedSearchRef.current) return;

    const timeout = window.setTimeout(() => {
      appliedSearchRef.current = searchInput;
      setFilters({ search: searchInput });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, setFilters]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, count, error } = await fetchPublicEvents(filters);

    if (error) {
      setLoadError(error.message ?? "Failed to load events.");
      setEvents([]);
      setTotalCount(0);
    } else {
      setEvents(data ?? []);
      setTotalCount(count);
    }

    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    router.push("/events");
  }, [router]);

  return {
    events,
    totalCount,
    totalPages,
    filters,
    loading,
    loadError,
    searchInput,
    hasActiveFilters,
    setSearchInput,
    setFilters,
    clearFilters,
  };
}
