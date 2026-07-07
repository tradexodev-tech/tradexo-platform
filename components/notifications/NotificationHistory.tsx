"use client";

import { Bell, SearchX } from "lucide-react";

import NotificationHistoryFilters from "@/components/notifications/NotificationHistoryFilters";
import NotificationHistoryTable from "@/components/notifications/NotificationHistoryTable";
import { useNotificationHistory } from "@/hooks/useNotificationHistory";

function NotificationHistoryLoadingState() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3 border-b pb-6">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}

function NotificationHistoryEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "bell" | "search";
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon === "search" ? (
          <SearchX className="size-5" aria-hidden="true" />
        ) : (
          <Bell className="size-5" aria-hidden="true" />
        )}
      </span>
      <p className="mt-4 text-base font-medium text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function NotificationHistory() {
  const {
    notifications,
    filters,
    searchInput,
    setSearchInput,
    updateFilters,
    setPage,
    totalCount,
    totalPages,
    loading,
    error,
    actionMessage,
    hasActiveFilters,
    selectedIds,
    allPageSelected,
    acting,
    toggleSelected,
    toggleSelectAll,
    markRead,
    markUnread,
    removeNotification,
    markSelectedRead,
    deleteSelected,
  } = useNotificationHistory();

  if (loading) {
    return <NotificationHistoryLoadingState />;
  }

  const showEmptyCatalog = totalCount === 0 && !hasActiveFilters && !error;
  const showNoUnread =
    totalCount === 0 && filters.read === "unread" && !error;
  const showNoResults =
    totalCount === 0 && hasActiveFilters && !showNoUnread && !error;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Notification History
        </h2>
        <p className="mt-1 text-muted-foreground">
          Browse, search, and manage all your Tradexo notifications.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {actionMessage ? (
        <div
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          role="status"
          aria-live="polite"
        >
          {actionMessage}
        </div>
      ) : null}

      <NotificationHistoryFilters
        search={searchInput}
        read={filters.read}
        type={filters.type}
        dateRange={filters.dateRange}
        sort={filters.sort}
        onSearchChange={setSearchInput}
        onReadChange={(value) => updateFilters({ read: value })}
        onTypeChange={(value) => updateFilters({ type: value })}
        onDateRangeChange={(value) => updateFilters({ dateRange: value })}
        onSortChange={(value) => updateFilters({ sort: value })}
      />

      {showEmptyCatalog ? (
        <NotificationHistoryEmptyState
          icon="bell"
          title="No notifications yet"
          description="Updates about inquiries, products, and system events will appear here."
        />
      ) : showNoUnread ? (
        <NotificationHistoryEmptyState
          icon="bell"
          title="No unread notifications"
          description="You are all caught up. Switch to All or Read to browse your notification history."
        />
      ) : showNoResults ? (
        <NotificationHistoryEmptyState
          icon="search"
          title="No matching notifications"
          description="Try adjusting your search or filters to find what you are looking for."
        />
      ) : (
        <NotificationHistoryTable
          notifications={notifications}
          selectedIds={selectedIds}
          allPageSelected={allPageSelected}
          acting={acting}
          page={filters.page}
          totalPages={totalPages}
          totalCount={totalCount}
          onToggleSelected={toggleSelected}
          onToggleSelectAll={toggleSelectAll}
          onMarkRead={markRead}
          onMarkUnread={markUnread}
          onDelete={removeNotification}
          onMarkSelectedRead={markSelectedRead}
          onDeleteSelected={deleteSelected}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
