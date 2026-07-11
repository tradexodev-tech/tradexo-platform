import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/event";
import { EVENT_STATUS_OPTIONS } from "@/types/event";

type EventStatusBadgeProps = {
  status: EventStatus;
  className?: string;
};

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-600/20",
  published: "bg-green-50 text-green-700 ring-green-600/20",
  archived: "bg-amber-50 text-amber-700 ring-amber-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const label =
    EVENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status],
        className
      )}
    >
      {label}
    </span>
  );
}
