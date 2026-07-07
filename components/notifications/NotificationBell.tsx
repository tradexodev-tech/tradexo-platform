"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";

import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { formatUnreadBadge } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const badgeLabel = formatUnreadBadge(unreadCount);

  const handleToggle = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      void markAsRead(notificationId);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    void markAllAsRead();
  }, [markAllAsRead]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label={
          badgeLabel
            ? `Notifications, ${badgeLabel} unread`
            : "Notifications"
        }
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        className={cn(
          "relative inline-flex size-10 items-center justify-center rounded-full border bg-white text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        )}
      >
        <Bell className="size-5 text-muted-foreground" aria-hidden="true" />

        {badgeLabel ? (
          <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        menuId={menuId}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onClose={handleClose}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        triggerRef={buttonRef}
      />
    </div>
  );
}
