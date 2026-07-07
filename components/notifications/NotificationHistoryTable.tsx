"use client";

import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";

import {
  getNotificationIconClassName,
  NotificationIcon,
} from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { formatNotificationRelativeTime } from "@/lib/notifications";
import { NOTIFICATION_HISTORY_PAGE_SIZE, NOTIFICATION_TYPE_LABELS } from "@/lib/notification-history";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

type NotificationHistoryTableProps = {
  notifications: Notification[];
  selectedIds: string[];
  allPageSelected: boolean;
  acting: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onToggleSelected: (notificationId: string) => void;
  onToggleSelectAll: () => void;
  onMarkRead: (notificationId: string) => void;
  onMarkUnread: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onMarkSelectedRead: () => void;
  onDeleteSelected: () => void;
  onPageChange: (page: number) => void;
};

function NotificationTypeLabel({ notification }: { notification: Notification }) {
  return (
    <span className="text-xs font-medium text-muted-foreground">
      {NOTIFICATION_TYPE_LABELS[notification.type]}
    </span>
  );
}

function NotificationRowActions({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (notificationId: string) => void;
  onMarkUnread: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {notification.is_read ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            void onMarkUnread(notification.id);
          }}
          aria-label={`Mark ${notification.title} as unread`}
        >
          <Mail className="size-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            void onMarkRead(notification.id);
          }}
          aria-label={`Mark ${notification.title} as read`}
        >
          <MailOpen className="size-3.5" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          void onDelete(notification.id);
        }}
        aria-label={`Delete ${notification.title}`}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function NotificationMobileCard({
  notification,
  selected,
  onToggleSelected,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: {
  notification: Notification;
  selected: boolean;
  onToggleSelected: (notificationId: string) => void;
  onMarkRead: (notificationId: string) => void;
  onMarkUnread: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}) {
  const relativeTime = formatNotificationRelativeTime(notification.created_at);
  const content = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
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

        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <NotificationTypeLabel notification={notification} />
          <span aria-hidden="true">·</span>
          <time dateTime={notification.created_at}>{relativeTime}</time>
        </span>
      </span>
    </>
  );

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm transition-colors",
        !notification.is_read && "border-blue-200 bg-blue-50/40",
        selected && "ring-2 ring-blue-500/40"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelected(notification.id)}
          className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Select ${notification.title}`}
        />

        {notification.action_url ? (
          <Link
            href={notification.action_url}
            className="flex min-w-0 flex-1 gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {content}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 gap-3">{content}</div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
        <NotificationRowActions
          notification={notification}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

export default function NotificationHistoryTable({
  notifications,
  selectedIds,
  allPageSelected,
  acting,
  page,
  totalPages,
  totalCount,
  onToggleSelected,
  onToggleSelectAll,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onMarkSelectedRead,
  onDeleteSelected,
  onPageChange,
}: NotificationHistoryTableProps) {
  const selectedCount = selectedIds.length;
  const pageStart =
    totalCount === 0 ? 0 : (page - 1) * NOTIFICATION_HISTORY_PAGE_SIZE + 1;
  const pageEnd = Math.min(page * NOTIFICATION_HISTORY_PAGE_SIZE, totalCount);

  return (
    <div className="space-y-4">
      {selectedCount > 0 ? (
        <div
          className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="region"
          aria-label="Bulk actions"
        >
          <p className="text-sm text-foreground">
            {selectedCount} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={acting}
              onClick={() => {
                void onMarkSelectedRead();
              }}
            >
              <Check className="size-3.5" />
              Mark Selected Read
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={acting}
              onClick={() => {
                void onDeleteSelected();
              }}
            >
              <Trash2 className="size-3.5" />
              Delete Selected
            </Button>
          </div>
        </div>
      ) : null}

      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={onToggleSelectAll}
                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Select all notifications on this page"
                  />
                </th>
                <th scope="col" className="px-4 py-3">
                  Notification
                </th>
                <th scope="col" className="px-4 py-3">
                  Type
                </th>
                <th scope="col" className="px-4 py-3">
                  Date
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {notifications.map((notification) => {
                const relativeTime = formatNotificationRelativeTime(
                  notification.created_at
                );
                const selected = selectedIds.includes(notification.id);

                return (
                  <tr
                    key={notification.id}
                    className={cn(
                      "transition-colors hover:bg-muted/20",
                      !notification.is_read && "bg-blue-50/40"
                    )}
                  >
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelected(notification.id)}
                        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select ${notification.title}`}
                      />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full",
                            getNotificationIconClassName(notification.type)
                          )}
                          aria-hidden="true"
                        >
                          <NotificationIcon
                            type={notification.type}
                            className="size-4"
                          />
                        </span>
                        <div className="min-w-0">
                          {notification.action_url ? (
                            <Link
                              href={notification.action_url}
                              className={cn(
                                "block text-sm text-foreground hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                                !notification.is_read
                                  ? "font-semibold"
                                  : "font-medium"
                              )}
                            >
                              {notification.title}
                            </Link>
                          ) : (
                            <p
                              className={cn(
                                "text-sm text-foreground",
                                !notification.is_read
                                  ? "font-semibold"
                                  : "font-medium"
                              )}
                            >
                              {notification.title}
                            </p>
                          )}
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <NotificationTypeLabel notification={notification} />
                    </td>
                    <td className="px-4 py-4 align-top text-muted-foreground">
                      <time dateTime={notification.created_at}>
                        {relativeTime}
                      </time>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          notification.is_read
                            ? "bg-muted text-muted-foreground"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <NotificationRowActions
                        notification={notification}
                        onMarkRead={onMarkRead}
                        onMarkUnread={onMarkUnread}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden" aria-label="Notification cards">
        {notifications.map((notification) => (
          <NotificationMobileCard
            key={notification.id}
            notification={notification}
            selected={selectedIds.includes(notification.id)}
            onToggleSelected={onToggleSelected}
            onMarkRead={onMarkRead}
            onMarkUnread={onMarkUnread}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalCount > 0 ? (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}–{pageEnd} of {totalCount}
          </p>
          <nav
            className="flex items-center gap-2"
            aria-label="Notification history pagination"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
