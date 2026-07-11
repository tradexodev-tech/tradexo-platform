import Link from "next/link";
import { Building2, Calendar, MapPin, Users } from "lucide-react";

import EventCountdown from "@/components/events/EventCountdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import { isRegistrationOpen } from "@/types/event";

type EventCardProps = {
  event: Event;
  showCountdown?: boolean;
};

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return "Date TBA";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  if (Number.isNaN(startDate.getTime())) return "Date TBA";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const startStr = startDate.toLocaleDateString(undefined, options);

  if (!endDate || Number.isNaN(endDate.getTime())) return startStr;

  const endStr = endDate.toLocaleDateString(undefined, options);
  return `${startStr} – ${endStr}`;
}

export default function EventCard({ event, showCountdown = true }: EventCardProps) {
  const registrationOpen = isRegistrationOpen(event);
  const countdownTarget = event.start_date ?? event.registration_end;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
        {event.banner_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.banner_image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {event.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.logo} alt="" className="max-h-16 max-w-[60%] object-contain" />
            ) : (
              <Calendar className="size-12 text-white/60" />
            )}
          </div>
        )}
        {event.industry ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {event.industry}
          </span>
        ) : null}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
          {event.event_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">
          {event.title}
        </h3>

        {event.short_description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {event.short_description}
          </p>
        ) : null}

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {[event.city, event.country].filter(Boolean).join(", ") || "Location TBA"}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" />
            {formatDateRange(event.start_date, event.end_date)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {event.expected_visitors != null ? (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {event.expected_visitors.toLocaleString()} visitors
            </span>
          ) : null}
          {event.expected_exhibitors != null ? (
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3.5" />
              {event.expected_exhibitors.toLocaleString()} exhibitors
            </span>
          ) : null}
        </div>

        {showCountdown && countdownTarget ? (
          <div className="mt-4">
            <EventCountdown targetDate={countdownTarget} />
          </div>
        ) : null}

        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild className="flex-1">
            <Link href={`/events/${event.slug}`}>View Details</Link>
          </Button>
          {registrationOpen ? (
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/events/${event.slug}#register`}>Register</Link>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Registration Closed
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrganizerEventCard({
  event,
  onPublish,
  onArchive,
  onDelete,
  publishing,
  archiving,
}: {
  event: Event;
  onPublish?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  publishing?: boolean;
  archiving?: boolean;
}) {
  return (
    <article className="flex flex-col rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">{event.title}</h3>
          <EventStatusBadgeInline status={event.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {[event.city, event.country].filter(Boolean).join(", ") || "No location"}
          {" · "}
          {formatDateRange(event.start_date, event.end_date)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${event.id}`}>Manage</Link>
        </Button>
        {event.status === "draft" && onPublish ? (
          <Button size="sm" onClick={onPublish} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        ) : null}
        {event.status === "published" && onArchive ? (
          <Button variant="outline" size="sm" onClick={onArchive} disabled={archiving}>
            {archiving ? "Archiving…" : "Archive"}
          </Button>
        ) : null}
        {event.status === "draft" && onDelete ? (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function EventStatusBadgeInline({ status }: { status: Event["status"] }) {
  const styles: Record<Event["status"], string> = {
    draft: "bg-slate-100 text-slate-600",
    published: "bg-green-100 text-green-700",
    archived: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", styles[status])}>
      {status}
    </span>
  );
}
