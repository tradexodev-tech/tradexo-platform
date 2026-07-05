"use client";

import {
  Archive,
  Eye,
  Inbox,
  Package,
  Pencil,
  Send,
  type LucideIcon,
} from "lucide-react";

import {
  formatActivityRelativeTime,
  type DashboardActivity,
  type DashboardActivityType,
} from "@/lib/dashboard-activity";

type RecentActivityFeedProps = {
  activities: DashboardActivity[];
  loading?: boolean;
  error?: string | null;
};

const iconConfig: Record<
  DashboardActivityType,
  { icon: LucideIcon; className: string }
> = {
  inquiry_received: {
    icon: Inbox,
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  inquiry_opened: {
    icon: Eye,
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  inquiry_reply_sent: {
    icon: Send,
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  inquiry_closed: {
    icon: Archive,
    className: "bg-muted text-muted-foreground ring-border",
  },
  product_published: {
    icon: Package,
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  product_updated: {
    icon: Pencil,
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

function FeedSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <SkeletonBlock className="h-6 w-36" />
      <SkeletonBlock className="mt-2 h-4 w-56" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border bg-background p-4"
          >
            <SkeletonBlock className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-full max-w-md" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      <p className="mt-3 text-sm text-destructive">
        {message}. Unable to load recent activity.
      </p>
    </div>
  );
}

function FeedEmpty() {
  return (
    <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      <p className="mt-3 text-sm text-muted-foreground">No recent activity</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Inquiry and product updates will appear here.
      </p>
    </div>
  );
}

export default function RecentActivityFeed({
  activities,
  loading = false,
  error,
}: RecentActivityFeedProps) {
  if (loading) {
    return <FeedSkeleton />;
  }

  if (error) {
    return <FeedError message={error} />;
  }

  if (activities.length === 0) {
    return <FeedEmpty />;
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Latest updates across inquiries and products
      </p>

      <ul className="mt-6 space-y-3">
        {activities.map((activity) => {
          const { icon: Icon, className } = iconConfig[activity.type];

          return (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-lg border bg-background p-4"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${className}`}
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <time
                  dateTime={activity.occurredAt}
                  className="mt-2 block text-xs text-muted-foreground"
                >
                  {formatActivityRelativeTime(activity.occurredAt)}
                </time>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
