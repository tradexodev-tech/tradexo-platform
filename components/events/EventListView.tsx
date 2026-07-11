"use client";

import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import EventCard from "@/components/events/EventCard";
import EventEmptyState from "@/components/events/EventEmptyState";
import EventFilters from "@/components/events/EventFilters";
import EventSkeleton from "@/components/events/EventSkeleton";
import { Button } from "@/components/ui/button";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import type { Event } from "@/types/event";

type EventListViewProps = {
  initialEvents?: Event[];
  initialCount?: number;
};

function EventListContent({ initialEvents, initialCount }: EventListViewProps) {
  const {
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
  } = usePublicEvents(initialEvents, initialCount);

  const showEmptyCatalog =
    !loading && totalCount === 0 && !hasActiveFilters && !loadError;
  const showNoResults =
    !loading && totalCount === 0 && hasActiveFilters && !loadError;
  const pageStart = totalCount === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const pageEnd = Math.min(filters.page * filters.pageSize, totalCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Trade Events</h1>
        <p className="mt-2 text-muted-foreground">
          Discover global trade exhibitions, conferences, and networking events powered by Tradexo.
        </p>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      {!showEmptyCatalog ? (
        <EventFilters
          search={searchInput}
          filters={filters}
          onSearchChange={setSearchInput}
          onIndustryChange={(industry) => setFilters({ industry })}
          onCountryChange={(country) => setFilters({ country })}
          onTimeframeChange={(timeframe) => setFilters({ timeframe })}
          onSortChange={(sort) => setFilters({ sort })}
        />
      ) : null}

      <div className="mt-6">
        {loading ? (
          <EventSkeleton />
        ) : showEmptyCatalog ? (
          <EventEmptyState />
        ) : showNoResults ? (
          <EventEmptyState
            title="No matching events"
            description="Try adjusting your search or filters to find trade events."
            showClearFilters
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {totalCount} event{totalCount === 1 ? "" : "s"} found
            </p>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {pageStart}–{pageEnd} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ page: filters.page - 1 })}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters({ page: filters.page + 1 })}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default function EventListView(props: EventListViewProps) {
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventListContent {...props} />
    </Suspense>
  );
}
