"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  archiveEvent,
  deleteEvent,
  fetchOrganizerEvents,
  fetchOrganizerStats,
  publishEvent,
} from "@/lib/events";
import type { Event, EventFilters, EventStatus, OrganizerEventStats } from "@/types/event";
import { DEFAULT_EVENT_FILTERS } from "@/types/event";

export const EVENT_PAGE_SIZE = 12;

export type OrganizerEventFilters = EventFilters & {
  search: string;
  status: EventStatus | "all";
  page: number;
  pageSize: number;
};

export const DEFAULT_ORGANIZER_EVENT_FILTERS: OrganizerEventFilters = {
  ...DEFAULT_EVENT_FILTERS,
  search: "",
  status: "all",
  page: 1,
  pageSize: EVENT_PAGE_SIZE,
};

type EventToast = {
  type: "success" | "error";
  message: string;
};

export function useEvents(initialFilters?: Partial<OrganizerEventFilters>) {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<OrganizerEventStats | null>(null);
  const [filters, setFiltersState] = useState<OrganizerEventFilters>({
    ...DEFAULT_ORGANIZER_EVENT_FILTERS,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<EventToast | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(
    () => initialFilters?.search ?? ""
  );
  const appliedSearchRef = useRef(searchInput);

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const showToast = useCallback((type: EventToast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const setFilters = useCallback((partial: Partial<OrganizerEventFilters>) => {
    setFiltersState((previous) => ({
      ...previous,
      ...partial,
      page:
        partial.page ??
        (partial.search !== undefined || partial.status !== undefined ? 1 : previous.page),
    }));
  }, []);

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

    const { data, count, error } = await fetchOrganizerEvents(filters);

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

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const { data, error } = await fetchOrganizerStats();

    if (error) {
      setStats(null);
    } else {
      setStats(data);
    }

    setStatsLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refresh = useCallback(async () => {
    await Promise.all([loadEvents(), loadStats()]);
  }, [loadEvents, loadStats]);

  const handlePublish = useCallback(
    async (event: Event) => {
      setPublishingId(event.id);
      const { data, error } = await publishEvent(event.id);
      setPublishingId(null);

      if (error) {
        showToast("error", error.message ?? "Failed to publish event.");
        return;
      }

      showToast("success", `"${data?.title ?? event.title}" published successfully.`);
      await refresh();
    },
    [refresh, showToast]
  );

  const handleArchive = useCallback(
    async (event: Event) => {
      setArchivingId(event.id);
      const { data, error } = await archiveEvent(event.id);
      setArchivingId(null);

      if (error) {
        showToast("error", error.message ?? "Failed to archive event.");
        return;
      }

      showToast("success", `"${data?.title ?? event.title}" archived.`);
      await refresh();
    },
    [refresh, showToast]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const { error } = await deleteEvent(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);

    if (error) {
      showToast("error", error.message ?? "Failed to delete event.");
      return;
    }

    showToast("success", "Draft event deleted.");
    await refresh();
  }, [deleteTarget, refresh, showToast]);

  return {
    events,
    totalCount,
    totalPages,
    stats,
    filters,
    loading,
    statsLoading,
    loadError,
    toast,
    publishingId,
    archivingId,
    deleteTarget,
    deleting,
    searchInput,
    setSearchInput,
    setFilters,
    setDeleteTarget,
    handlePublish,
    handleArchive,
    handleDelete,
    refresh,
    showToast,
  };
}
