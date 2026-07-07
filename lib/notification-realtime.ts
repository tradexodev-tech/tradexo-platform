import type { RealtimeChannel } from "@supabase/supabase-js";

import { mapNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/notification";

export type NotificationRealtimeHandlers = {
  onInsert: (notification: Notification) => void;
  onUpdate: (notification: Notification) => void;
};

export function buildNotificationRealtimeFilter(userId: string) {
  return `user_id=eq.${userId}`;
}

export async function ensureRealtimeAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { session: null, error: "No active session for realtime auth." };
  }

  await supabase.realtime.setAuth(session.access_token);

  return { session, error: null };
}

export async function subscribeToNotificationChanges(
  userId: string,
  handlers: NotificationRealtimeHandlers
): Promise<RealtimeChannel> {
  const filter = buildNotificationRealtimeFilter(userId);

  const { session, error } = await ensureRealtimeAuth();

  if (!session) {
    console.info("[Tradexo Debug] realtime auth unavailable", {
      userId,
      filter,
      error,
    });
  }

  console.info("[Tradexo Debug] subscribing notifications channel", {
    userId,
    filter,
    hasSession: Boolean(session),
  });

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter,
      },
      (payload) => {
        console.info("[Tradexo Debug] INSERT received", {
          id: (payload.new as { id?: string } | null)?.id,
          userId: (payload.new as { user_id?: string } | null)?.user_id,
        });
        handlers.onInsert(
          mapNotification(payload.new as Record<string, unknown>)
        );
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter,
      },
      (payload) => {
        console.info("[Tradexo Debug] UPDATE received", {
          id: (payload.new as { id?: string } | null)?.id,
          userId: (payload.new as { user_id?: string } | null)?.user_id,
          isRead: (payload.new as { is_read?: boolean } | null)?.is_read,
        });
        handlers.onUpdate(
          mapNotification(payload.new as Record<string, unknown>)
        );
      }
    )
    .subscribe((status, err) => {
      console.info("[Tradexo Debug] channel subscribed", {
        status,
        error: err?.message ?? null,
        userId,
        filter,
      });
    });

  return channel;
}

export async function unsubscribeFromNotificationChanges(
  channel: RealtimeChannel | null
) {
  if (!channel) {
    return;
  }

  await supabase.removeChannel(channel);
}
