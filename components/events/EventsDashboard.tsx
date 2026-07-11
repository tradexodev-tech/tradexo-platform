"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Users, Calendar, FileText, DollarSign, Handshake } from "lucide-react";

import { OrganizerEventCard } from "@/components/events/EventCard";
import { OrganizerEventFilters } from "@/components/events/EventFilters";
import EventEmptyState from "@/components/events/EventEmptyState";
import EventSkeleton from "@/components/events/EventSkeleton";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  placeholder,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  placeholder?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
      ) : placeholder ? (
        <p className="mt-2 text-2xl font-bold text-muted-foreground/50">—</p>
      ) : (
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}

function DeleteDialog({
  open,
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 left-0 z-50 flex items-center justify-center p-4 md:left-64">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={deleting ? undefined : onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">Delete draft event?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{title || "this event"}</span>?
          This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EventsDashboard() {
  const {
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
  } = useEvents();

  const pageStart = totalCount === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const pageEnd = Math.min(filters.page * filters.pageSize, totalCount);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your trade events, registrations, and exhibitor operations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <Plus className="size-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {toast ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            toast.type === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-green-200 bg-green-50 text-green-800"
          )}
        >
          {toast.message}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Events"
          value={stats?.total ?? 0}
          icon={Calendar}
          loading={statsLoading}
        />
        <StatCard
          label="Upcoming"
          value={stats?.upcoming ?? 0}
          icon={Calendar}
          loading={statsLoading}
        />
        <StatCard
          label="Published"
          value={stats?.published ?? 0}
          icon={FileText}
          loading={statsLoading}
        />
        <StatCard
          label="Drafts"
          value={stats?.draft ?? 0}
          icon={FileText}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Expected Visitors"
          value={(stats?.totalVisitors ?? 0).toLocaleString()}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          label="Expected Exhibitors"
          value={(stats?.totalExhibitors ?? 0).toLocaleString()}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard label="Meetings" value="—" icon={Handshake} placeholder />
        <StatCard label="Revenue" value="—" icon={DollarSign} placeholder />
      </div>

      {/* Recent Registrations */}
      {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Recent Registrations</h2>
          <div className="mt-3 divide-y">
            {stats.recentRegistrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    {reg.full_name || reg.email}
                  </p>
                  <p className="text-muted-foreground capitalize">
                    {reg.registration_type} · {reg.status}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(reg.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/events/create">Create Event</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/events">View Public Events</Link>
        </Button>
        <Button variant="outline" size="sm" disabled>
          Export Registrations (Soon)
        </Button>
      </div>

      {/* Event list */}
      <div>
        <h2 className="mb-4 font-semibold text-foreground">My Events</h2>

        <OrganizerEventFilters
          search={searchInput}
          status={filters.status ?? "all"}
          onSearchChange={setSearchInput}
          onStatusChange={(status) =>
            setFilters({ status: status as typeof filters.status })
          }
        />

        {loadError ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {loading ? (
            <EventSkeleton count={3} />
          ) : events.length === 0 ? (
            <EventEmptyState
              title="No events yet"
              description="Create your first trade event to start building your exhibitor and visitor community."
            />
          ) : (
            events.map((event) => (
              <OrganizerEventCard
                key={event.id}
                event={event}
                onPublish={() => handlePublish(event)}
                onArchive={() => handleArchive(event)}
                onDelete={() => setDeleteTarget(event)}
                publishing={publishingId === event.id}
                archiving={archivingId === event.id}
              />
            ))
          )}
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between">
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
      </div>

      <DeleteDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
