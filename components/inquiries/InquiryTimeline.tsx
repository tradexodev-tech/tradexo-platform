import {
  Archive,
  Eye,
  Inbox,
  Send,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { InquiryTimelineEvent } from "@/lib/inquiry-timeline";

type InquiryTimelineProps = {
  events: InquiryTimelineEvent[];
};

const iconConfig: Record<
  InquiryTimelineEvent["type"],
  { icon: LucideIcon; className: string }
> = {
  submitted: {
    icon: Inbox,
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  opened: {
    icon: Eye,
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  replied: {
    icon: Send,
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  closed: {
    icon: Archive,
    className: "bg-muted text-muted-foreground ring-border",
  },
};

function formatTimelineTimestamp(dateString: string | null) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InquiryTimeline({ events }: InquiryTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <ol className="relative space-y-0" aria-label="Inquiry timeline">
      {events.map((event, index) => {
        const { icon: Icon, className } = iconConfig[event.type];
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                className="absolute top-8 left-4 h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-border"
                aria-hidden="true"
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                className
              )}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <time
                dateTime={event.timestamp ?? undefined}
                className="mt-0.5 block text-xs text-muted-foreground"
              >
                {formatTimelineTimestamp(event.timestamp)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
