"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  acquireNotificationRealtimeSubscription,
  type NotificationRealtimeSubscription,
} from "@/lib/notification-realtime";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATIONS_FETCH_LIMIT,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/notification";

type UseNotificationsOptions = {
  enableRealtime?: boolean;
};

export function useNotifications(options?: UseNotificationsOptions) {
  const enableRealtime = options?.enableRealtime ?? false;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);
  const notificationsRef = useRef(notifications);
  const unreadCountRef = useRef(unreadCount);
  const subscriptionRef = useRef<NotificationRealtimeSubscription | null>(null);
  const mountIdRef = useRef(0);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!realtimeToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRealtimeToast(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [realtimeToast]);

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

  const handleRealtimeInsert = useCallback((notification: Notification) => {
    const alreadyExists = notificationsRef.current.some(
      (item) => item.id === notification.id
    );

    if (alreadyExists) {
      return;
    }

    setNotifications((previous) =>
      [notification, ...previous].slice(0, NOTIFICATIONS_FETCH_LIMIT)
    );

    if (!notification.is_read) {
      setUnreadCount((previous) => previous + 1);
      setRealtimeToast("New notification received.");
    }
  }, []);

  const handleRealtimeUpdate = useCallback((notification: Notification) => {
    const existing = notificationsRef.current.find(
      (item) => item.id === notification.id
    );

    if (!existing) {
      return;
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? notification : item
      )
    );

    if (existing.is_read === notification.is_read) {
      return;
    }

    if (notification.is_read) {
      setUnreadCount((previous) => Math.max(0, previous - 1));
      return;
    }

    setUnreadCount((previous) => previous + 1);
  }, []);

  const realtimeHandlersRef = useRef({
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
  });

  useEffect(() => {
    realtimeHandlersRef.current = {
      onInsert: handleRealtimeInsert,
      onUpdate: handleRealtimeUpdate,
    };
  }, [handleRealtimeInsert, handleRealtimeUpdate]);

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

  useEffect(() => {
    if (!enableRealtime) {
      return;
    }

    const mountId = ++mountIdRef.current;
    let cancelled = false;

    console.info("[Tradexo Debug] useNotifications realtime mount", {
      mountId,
      enableRealtime,
    });

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.user) {
        console.info("[Tradexo Debug] useNotifications realtime skipped", {
          mountId,
          cancelled,
          hasUser: Boolean(session?.user),
        });
        return;
      }

      if (subscriptionRef.current) {
        console.info("[Tradexo Debug] useNotifications realtime already active", {
          mountId,
          userId: session.user.id,
        });
        return;
      }

      subscriptionRef.current = await acquireNotificationRealtimeSubscription(
        session.user.id,
        {
          onInsert: (notification) => {
            realtimeHandlersRef.current.onInsert(notification);
          },
          onUpdate: (notification) => {
            realtimeHandlersRef.current.onUpdate(notification);
          },
        }
      );
    })();

    return () => {
      cancelled = true;
      console.info("[Tradexo Debug] useNotifications realtime cleanup", {
        mountId,
      });
      const subscription = subscriptionRef.current;
      subscriptionRef.current = null;
      if (subscription) {
        void subscription.release();
      }
    };
  }, [enableRealtime]);

  useEffect(() => {
    if (!enableRealtime) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        void supabase.realtime.setAuth(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime]);

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
      realtimeToast,
      markAsRead,
      markAllAsRead,
      refresh: loadNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      realtimeToast,
      markAsRead,
      markAllAsRead,
      loadNotifications,
    ]
  );
}
