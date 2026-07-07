import {
  Bell,
  Info,
  MessageSquare,
  Package,
  PackageCheck,
  Reply,
} from "lucide-react";

import { formatNotificationRelativeTime } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
};

function NotificationIcon({
  type,
  className,
}: {
  type: NotificationType;
  className?: string;
}) {
  switch (type) {
    case "inquiry_received":
      return <MessageSquare className={className} aria-hidden="true" />;
    case "inquiry_replied":
      return <Reply className={className} aria-hidden="true" />;
    case "product_published":
      return <PackageCheck className={className} aria-hidden="true" />;
    case "product_updated":
      return <Package className={className} aria-hidden="true" />;
    case "system":
    default:
      return <Info className={className} aria-hidden="true" />;
  }
}

function getNotificationIconClassName(type: NotificationType) {
  switch (type) {
    case "inquiry_received":
      return "bg-blue-100 text-blue-700";
    case "inquiry_replied":
      return "bg-emerald-100 text-emerald-700";
    case "product_published":
      return "bg-violet-100 text-violet-700";
    case "product_updated":
      return "bg-amber-100 text-amber-700";
    case "system":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const relativeTime = formatNotificationRelativeTime(notification.created_at);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        if (!notification.is_read) {
          onMarkAsRead(notification.id);
        }
      }}
      className={cn(
        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        !notification.is_read && "bg-blue-50/60"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          getNotificationIconClassName(notification.type)
        )}
        aria-hidden="true"
      >
        <NotificationIcon type={notification.type} className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-sm text-foreground",
              !notification.is_read ? "font-semibold" : "font-medium"
            )}
          >
            {notification.title}
          </span>
          {!notification.is_read ? (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600"
              aria-hidden="true"
            />
          ) : null}
        </span>

        <span className="mt-1 block text-sm text-muted-foreground">
          {notification.message}
        </span>

        <span className="mt-2 block text-xs text-muted-foreground">
          <time dateTime={notification.created_at}>{relativeTime}</time>
        </span>
      </span>

      {notification.is_read ? null : (
        <span className="sr-only">Unread notification</span>
      )}
    </button>
  );
}

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Bell className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">No notifications yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Updates about inquiries and products will appear here.
      </p>
    </div>
  );
}
