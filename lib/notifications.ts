import { supabase } from "@/lib/supabase";
import type { Notification, NotificationType } from "@/types/notification";

export const NOTIFICATIONS_FETCH_LIMIT = 20;

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

export function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as NotificationType,
    title: (row.title as string) ?? "",
    message: (row.message as string) ?? "",
    entity_type: (row.entity_type as string | null) ?? null,
    entity_id: (row.entity_id as string | null) ?? null,
    action_url: (row.action_url as string | null) ?? null,
    is_read: Boolean(row.is_read),
    created_at: (row.created_at as string) ?? "",
  };
}

export function formatUnreadBadge(count: number) {
  if (count <= 0) {
    return null;
  }

  if (count > 99) {
    return "99+";
  }

  return String(count);
}

export function formatNotificationRelativeTime(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(createdAt).toLocaleDateString();
}

export async function fetchNotifications(limit = NOTIFICATIONS_FETCH_LIMIT) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: [], error: authError };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) => mapNotification(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchUnreadNotificationCount() {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: 0, error: authError };
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    return { data: null, error };
  }

  return { data: count ?? 0, error: null };
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function markAllNotificationsAsRead() {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .select("id");

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function markNotificationAsUnread(notificationId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: false })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId || notificationIds.length === 0) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteNotification(notificationId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { error: authError };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  return { error };
}

export async function deleteNotifications(notificationIds: string[]) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId || notificationIds.length === 0) {
    return { error: authError };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .in("id", notificationIds)
    .eq("user_id", userId);

  return { error };
}
