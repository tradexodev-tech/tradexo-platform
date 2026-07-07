"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import NotificationItem, {
  NotificationEmptyState,
} from "@/components/notifications/NotificationItem";
import { formatUnreadBadge } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

type NotificationDropdownProps = {
  isOpen: boolean;
  menuId: string;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  className?: string;
};

export default function NotificationDropdown({
  isOpen,
  menuId,
  notifications,
  unreadCount,
  loading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  triggerRef,
  className,
}: NotificationDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const firstItem = panelRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"], a[href]'
    );
    firstItem?.focus();
  }, [isOpen, loading, notifications.length]);

  if (!isOpen) {
    return null;
  }

  const badgeLabel = formatUnreadBadge(unreadCount);

  return (
    <div
      ref={containerRef}
      className={cn("absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))]", className)}
    >
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        aria-label="Notifications"
        className="overflow-hidden rounded-xl border bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {badgeLabel ? (
              <p className="text-xs text-muted-foreground">
                {badgeLabel} unread
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">You are all caught up</p>
            )}
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                void onMarkAllAsRead();
              }}
              className="text-xs font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Mark all as read
            </button>
          ) : null}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {loading ? (
            <div className="space-y-3 px-4 py-4" aria-busy="true" aria-live="polite">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="size-9 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t bg-muted/20 px-4 py-3">
          <Link
            href="/dashboard/notifications"
            className="block text-center text-sm font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={onClose}
          >
            View All Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
