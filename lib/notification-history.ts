import {
  mapNotification,
} from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import type { Notification, NotificationType } from "@/types/notification";

export const NOTIFICATION_HISTORY_PAGE_SIZE = 20;

export type NotificationReadFilter = "all" | "unread" | "read";
export type NotificationDateRangeFilter = "today" | "7d" | "30d" | "all";
export type NotificationHistorySort = "newest" | "oldest";
export type NotificationTypeFilter = NotificationType | "all";

export type NotificationHistoryFilters = {
  search: string;
  read: NotificationReadFilter;
  type: NotificationTypeFilter;
  dateRange: NotificationDateRangeFilter;
  sort: NotificationHistorySort;
  page: number;
};

export const DEFAULT_NOTIFICATION_HISTORY_FILTERS: NotificationHistoryFilters = {
  search: "",
  read: "all",
  type: "all",
  dateRange: "all",
  sort: "newest",
  page: 1,
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  inquiry_received: "New Inquiry",
  inquiry_replied: "Inquiry Reply",
  product_published: "Product Published",
  product_updated: "Product Updated",
  system: "System",
};

export const NOTIFICATION_TYPE_FILTER_OPTIONS: Array<{
  value: NotificationTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All Types" },
  { value: "inquiry_received", label: NOTIFICATION_TYPE_LABELS.inquiry_received },
  { value: "inquiry_replied", label: NOTIFICATION_TYPE_LABELS.inquiry_replied },
  { value: "product_published", label: NOTIFICATION_TYPE_LABELS.product_published },
  { value: "product_updated", label: NOTIFICATION_TYPE_LABELS.product_updated },
  { value: "system", label: NOTIFICATION_TYPE_LABELS.system },
];

async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { userId: null, error: error ?? { message: "User not authenticated" } };
  }

  return { userId: user.id, error: null };
}

function escapePostgrestIlikePattern(search: string) {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '""')
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  return `"%${escaped}%"`;
}

export function getNotificationDateRangeStart(
  dateRange: NotificationDateRangeFilter
) {
  const now = new Date();

  if (dateRange === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (dateRange === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (dateRange === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

export function notificationHistoryFiltersAreActive(
  filters: NotificationHistoryFilters
) {
  return (
    filters.search.trim().length > 0 ||
    filters.read !== "all" ||
    filters.type !== "all" ||
    filters.dateRange !== "all"
  );
}

export function notificationMatchesHistoryFilters(
  notification: Notification,
  filters: NotificationHistoryFilters
) {
  if (filters.read === "unread" && notification.is_read) {
    return false;
  }

  if (filters.read === "read" && !notification.is_read) {
    return false;
  }

  if (filters.type !== "all" && notification.type !== filters.type) {
    return false;
  }

  const trimmedSearch = filters.search.trim().toLowerCase();
  if (trimmedSearch) {
    const matchesSearch =
      notification.title.toLowerCase().includes(trimmedSearch) ||
      notification.message.toLowerCase().includes(trimmedSearch);

    if (!matchesSearch) {
      return false;
    }
  }

  const rangeStart = getNotificationDateRangeStart(filters.dateRange);
  if (rangeStart) {
    const createdAt = new Date(notification.created_at).getTime();
    if (Number.isNaN(createdAt) || createdAt < rangeStart.getTime()) {
      return false;
    }
  }

  return true;
}

export async function fetchNotificationHistory(
  filters: NotificationHistoryFilters
) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, count: 0, error: authError };
  }

  const page = Math.max(1, filters.page);
  const from = (page - 1) * NOTIFICATION_HISTORY_PAGE_SIZE;
  const to = from + NOTIFICATION_HISTORY_PAGE_SIZE - 1;

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  const trimmedSearch = filters.search.trim();
  if (trimmedSearch) {
    const pattern = escapePostgrestIlikePattern(trimmedSearch);
    query = query.or(`title.ilike.${pattern},message.ilike.${pattern}`);
  }

  if (filters.read === "unread") {
    query = query.eq("is_read", false);
  } else if (filters.read === "read") {
    query = query.eq("is_read", true);
  }

  if (filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  const rangeStart = getNotificationDateRangeStart(filters.dateRange);
  if (rangeStart) {
    query = query.gte("created_at", rangeStart.toISOString());
  }

  query = query.order("created_at", {
    ascending: filters.sort === "oldest",
  });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { data: null, count: 0, error };
  }

  return {
    data: (data ?? []).map((row) => mapNotification(row as Record<string, unknown>)),
    count: count ?? 0,
    error: null,
  };
}
