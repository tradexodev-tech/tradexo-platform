"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications";
import type { Notification } from "@/types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notificationsRef = useRef(notifications);
  const unreadCountRef = useRef(unreadCount);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const loadNotifications = useCallback(async () => {
    const [notificationsResult, unreadResult] = await Promise.all([
      fetchNotifications(),
      fetchUnreadNotificationCount(),
    ]);

    if (!notificationsResult.error && notificationsResult.data) {
      setNotifications(notificationsResult.data);
    }

    if (!unreadResult.error && unreadResult.data != null) {
      setUnreadCount(unreadResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadNotifications();

      if (cancelled) {
        return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const currentNotifications = notificationsRef.current;
    const target = currentNotifications.find(
      (notification) => notification.id === notificationId
    );

    if (!target || target.is_read) {
      return;
    }

    const previousNotifications = currentNotifications;
    const previousUnreadCount = unreadCountRef.current;

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
    setUnreadCount((previous) => Math.max(0, previous - 1));

    const { error } = await markNotificationAsRead(notificationId);

    if (error) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (unreadCountRef.current === 0) {
      return;
    }

    const previousNotifications = notificationsRef.current;
    const previousUnreadCount = unreadCountRef.current;

    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, is_read: true }))
    );
    setUnreadCount(0);

    const { error } = await markAllNotificationsAsRead();

    if (error) {
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, []);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      refresh: loadNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      loadNotifications,
    ]
  );
}
