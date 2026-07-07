import { supabase } from "@/lib/supabase";
import {
  NOTIFICATION_PREFERENCE_DEFAULTS,
  type NotificationPreferenceKey,
  type NotificationPreferences,
} from "@/types/notification-preferences";

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

function mapNotificationPreferences(
  row: Record<string, unknown>
): NotificationPreferences {
  return {
    user_id: row.user_id as string,
    email_new_inquiry: Boolean(row.email_new_inquiry),
    email_inquiry_reply: Boolean(row.email_inquiry_reply),
    email_product_published: Boolean(row.email_product_published),
    email_system: Boolean(row.email_system),
    inapp_new_inquiry: Boolean(row.inapp_new_inquiry),
    inapp_inquiry_reply: Boolean(row.inapp_inquiry_reply),
    inapp_product_published: Boolean(row.inapp_product_published),
    inapp_system: Boolean(row.inapp_system),
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

export async function fetchNotificationPreferences() {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (data) {
    return {
      data: mapNotificationPreferences(data as Record<string, unknown>),
      error: null,
    };
  }

  return createDefaultNotificationPreferences(userId);
}

async function createDefaultNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .insert({
      user_id: userId,
      ...NOTIFICATION_PREFERENCE_DEFAULTS,
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return {
    data: mapNotificationPreferences(data as Record<string, unknown>),
    error: null,
  };
}

export async function updateNotificationPreference(
  key: NotificationPreferenceKey,
  value: boolean
) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .update({ [key]: value })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return {
    data: mapNotificationPreferences(data as Record<string, unknown>),
    error: null,
  };
}
