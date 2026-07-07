"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  acquireNotificationRealtimeSubscription,
  type NotificationRealtimeSubscription,
} from "@/lib/notification-realtime";
import {
  DEFAULT_NOTIFICATION_HISTORY_FILTERS,
  fetchNotificationHistory,
  NOTIFICATION_HISTORY_PAGE_SIZE,
  notificationHistoryFiltersAreActive,
  notificationMatchesHistoryFilters,
  type NotificationHistoryFilters,
} from "@/lib/notification-history";
import {
  deleteNotification,
  deleteNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markNotificationsAsRead,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/notification";

const SEARCH_DEBOUNCE_MS = 400;

export function useNotificationHistory() {
  const [filters, setFiltersState] = useState<NotificationHistoryFilters>(
    DEFAULT_NOTIFICATION_HISTORY_FILTERS
  );
  const [searchInput, setSearchInput] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [acting, setActing] = useState(false);
  const [, startTransition] = useTransition();

  const filtersRef = useRef(filters);
  const notificationsRef = useRef(notifications);
  const subscriptionRef = useRef<NotificationRealtimeSubscription | null>(null);
  const appliedSearchRef = useRef(searchInput);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    appliedSearchRef.current = filters.search;
  }, [filters.search]);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActionMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [actionMessage]);

  const hasActiveFilters = useMemo(
    () => notificationHistoryFiltersAreActive(filters),
    [filters]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / NOTIFICATION_HISTORY_PAGE_SIZE)),
    [totalCount]
  );

  const loadHistory = useCallback(async (nextFilters: NotificationHistoryFilters) => {
    setLoading(true);
    setError(null);

    const { data, count, error: fetchError } =
      await fetchNotificationHistory(nextFilters);

    if (fetchError) {
      setError(fetchError.message ?? "Failed to load notifications.");
      setNotifications([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setNotifications(data ?? []);
    setTotalCount(count);
    setSelectedIds((previous) =>
      previous.filter((id) => (data ?? []).some((item) => item.id === id))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== appliedSearchRef.current) {
        setFiltersState((previous) => ({
          ...previous,
          search: searchInput,
          page: 1,
        }));
        setSelectedIds([]);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    startTransition(() => {
      void (async () => {
        setLoading(true);
        setError(null);

        const { data, count, error: fetchError } =
          await fetchNotificationHistory(filters);

        if (cancelled) {
          return;
        }

        if (fetchError) {
          setError(fetchError.message ?? "Failed to load notifications.");
          setNotifications([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }

        setNotifications(data ?? []);
        setTotalCount(count);
        setSelectedIds((previous) =>
          previous.filter((id) => (data ?? []).some((item) => item.id === id))
        );
        setLoading(false);
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [filters, startTransition]);

  const handleRealtimeInsert = useCallback((notification: Notification) => {
    const currentFilters = filtersRef.current;

    if (!notificationMatchesHistoryFilters(notification, currentFilters)) {
      return;
    }

    setTotalCount((previous) => previous + 1);

    if (currentFilters.page !== 1 || currentFilters.sort !== "newest") {
      return;
    }

    setNotifications((previous) => {
      if (previous.some((item) => item.id === notification.id)) {
        return previous;
      }

      return [notification, ...previous].slice(0, NOTIFICATION_HISTORY_PAGE_SIZE);
    });
  }, []);

  const handleRealtimeUpdate = useCallback((notification: Notification) => {
    const currentFilters = filtersRef.current;
    const exists = notificationsRef.current.some(
      (item) => item.id === notification.id
    );
    const matches = notificationMatchesHistoryFilters(
      notification,
      currentFilters
    );

    if (exists && !matches) {
      setNotifications((previous) =>
        previous.filter((item) => item.id !== notification.id)
      );
      setTotalCount((previous) => Math.max(0, previous - 1));
      return;
    }

    if (!exists && matches && currentFilters.page === 1) {
      handleRealtimeInsert(notification);
      return;
    }

    if (!exists) {
      return;
    }

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? notification : item
      )
    );
  }, [handleRealtimeInsert]);

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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.user) {
        return;
      }

      if (subscriptionRef.current) {
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
      const subscription = subscriptionRef.current;
      subscriptionRef.current = null;
      if (subscription) {
        void subscription.release();
      }
    };
  }, []);

  const updateFilters = useCallback(
    (patch: Partial<NotificationHistoryFilters>) => {
      setFiltersState((previous) => ({
        ...previous,
        ...patch,
        page:
          patch.page ??
          (patch.read !== undefined ||
          patch.type !== undefined ||
          patch.dateRange !== undefined ||
          patch.sort !== undefined
            ? 1
            : previous.page),
      }));
      setSelectedIds([]);
    },
    []
  );

  const setPage = useCallback((page: number) => {
    setFiltersState((previous) => ({
      ...previous,
      page: Math.max(1, page),
    }));
    setSelectedIds([]);
  }, []);

  const toggleSelected = useCallback((notificationId: string) => {
    setSelectedIds((previous) =>
      previous.includes(notificationId)
        ? previous.filter((id) => id !== notificationId)
        : [...previous, notificationId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((previous) => {
      const pageIds = notificationsRef.current.map((item) => item.id);
      const allSelected =
        pageIds.length > 0 && pageIds.every((id) => previous.includes(id));

      if (allSelected) {
        return previous.filter((id) => !pageIds.includes(id));
      }

      return [...new Set([...previous, ...pageIds])];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const refreshCurrentPage = useCallback(async () => {
    await loadHistory(filtersRef.current);
  }, [loadHistory]);

  const markRead = useCallback(async (notificationId: string) => {
    const previous = notificationsRef.current;
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    );

    const { error: updateError } = await markNotificationAsRead(notificationId);
    if (updateError) {
      setNotifications(previous);
      setError(updateError.message ?? "Failed to mark notification as read.");
      return;
    }

    setActionMessage("Notification marked as read.");
  }, []);

  const markUnread = useCallback(async (notificationId: string) => {
    const previous = notificationsRef.current;
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, is_read: false } : item
      )
    );

    const { error: updateError } =
      await markNotificationAsUnread(notificationId);

    if (updateError) {
      setNotifications(previous);
      setError(updateError.message ?? "Failed to mark notification as unread.");
      return;
    }

    setActionMessage("Notification marked as unread.");
  }, []);

  const removeNotification = useCallback(
    async (notificationId: string) => {
      const previous = notificationsRef.current;
      const previousCount = totalCount;

      setNotifications((current) =>
        current.filter((item) => item.id !== notificationId)
      );
      setTotalCount((current) => Math.max(0, current - 1));
      setSelectedIds((current) => current.filter((id) => id !== notificationId));

      const { error: deleteError } = await deleteNotification(notificationId);

      if (deleteError) {
        setNotifications(previous);
        setTotalCount(previousCount);
        setError(deleteError.message ?? "Failed to delete notification.");
        return;
      }

      setActionMessage("Notification deleted.");
      await refreshCurrentPage();
    },
    [refreshCurrentPage, totalCount]
  );

  const markSelectedRead = useCallback(async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setActing(true);
    const previous = notificationsRef.current;

    setNotifications((current) =>
      current.map((item) =>
        selectedIds.includes(item.id) ? { ...item, is_read: true } : item
      )
    );

    const { error: updateError } = await markNotificationsAsRead(selectedIds);
    setActing(false);

    if (updateError) {
      setNotifications(previous);
      setError(
        updateError.message ?? "Failed to mark selected notifications as read."
      );
      return;
    }

    setActionMessage("Selected notifications marked as read.");
    clearSelection();
  }, [clearSelection, selectedIds]);

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) {
      return;
    }

    setActing(true);
    const previous = notificationsRef.current;
    const previousCount = totalCount;
    const idsToDelete = [...selectedIds];

    setNotifications((current) =>
      current.filter((item) => !idsToDelete.includes(item.id))
    );
    setTotalCount((current) => Math.max(0, current - idsToDelete.length));
    clearSelection();

    const { error: deleteError } = await deleteNotifications(idsToDelete);
    setActing(false);

    if (deleteError) {
      setNotifications(previous);
      setTotalCount(previousCount);
      setError(
        deleteError.message ?? "Failed to delete selected notifications."
      );
      return;
    }

    setActionMessage("Selected notifications deleted.");
    await refreshCurrentPage();
  }, [clearSelection, refreshCurrentPage, selectedIds, totalCount]);

  const allPageSelected = useMemo(() => {
    if (notifications.length === 0) {
      return false;
    }

    return notifications.every((item) => selectedIds.includes(item.id));
  }, [notifications, selectedIds]);

  return {
    notifications,
    filters,
    searchInput,
    setSearchInput,
    updateFilters,
    setPage,
    totalCount,
    totalPages,
    loading,
    error,
    actionMessage,
    hasActiveFilters,
    selectedIds,
    allPageSelected,
    acting,
    toggleSelected,
    toggleSelectAll,
    clearSelection,
    markRead,
    markUnread,
    removeNotification,
    markSelectedRead,
    deleteSelected,
  };
}
