import type { RealtimeChannel } from "@supabase/supabase-js";

import { mapNotification } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/notification";

export type NotificationRealtimeHandlers = {
  onInsert: (notification: Notification) => void;
  onUpdate: (notification: Notification) => void;
};

export type NotificationRealtimeSubscription = {
  id: string;
  release: () => Promise<void>;
};

let sharedChannel: RealtimeChannel | null = null;
let sharedUserId: string | null = null;
let listenerCounter = 0;
const listeners = new Map<string, NotificationRealtimeHandlers>();

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

function dispatchInsert(notification: Notification) {
  for (const handlers of listeners.values()) {
    handlers.onInsert(notification);
  }
}

function dispatchUpdate(notification: Notification) {
  for (const handlers of listeners.values()) {
    handlers.onUpdate(notification);
  }
}

async function teardownSharedChannel() {
  if (!sharedChannel) {
    return;
  }

  await supabase.removeChannel(sharedChannel);
  sharedChannel = null;
  sharedUserId = null;
}

async function ensureSharedChannel(userId: string) {
  if (sharedChannel && sharedUserId === userId) {
    return sharedChannel;
  }

  await teardownSharedChannel();

  const { session, error } = await ensureRealtimeAuth();

  if (!session) {
    console.info("[Tradexo Debug] realtime auth unavailable", {
      userId,
      error,
    });
  }

  const filter = buildNotificationRealtimeFilter(userId);

  console.info("[Tradexo Debug] subscribing notifications channel", {
    userId,
    filter,
    hasSession: Boolean(session),
    listenerCount: listeners.size,
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
        dispatchInsert(
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
        dispatchUpdate(
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

  sharedChannel = channel;
  sharedUserId = userId;

  return channel;
}

export async function acquireNotificationRealtimeSubscription(
  userId: string,
  handlers: NotificationRealtimeHandlers
): Promise<NotificationRealtimeSubscription> {
  const id = `notification-listener-${++listenerCounter}`;
  listeners.set(id, handlers);

  await ensureSharedChannel(userId);

  return {
    id,
    release: async () => {
      listeners.delete(id);

      if (listeners.size > 0) {
        return;
      }

      console.info("[Tradexo Debug] tearing down notifications channel", {
        userId: sharedUserId,
      });

      await teardownSharedChannel();
    },
  };
}

/** @deprecated Use acquireNotificationRealtimeSubscription instead. */
export async function subscribeToNotificationChanges(
  userId: string,
  handlers: NotificationRealtimeHandlers
): Promise<RealtimeChannel> {
  await acquireNotificationRealtimeSubscription(userId, handlers);
  return sharedChannel!;
}

/** @deprecated Use NotificationRealtimeSubscription.release instead. */
export async function unsubscribeFromNotificationChanges(
  channel: RealtimeChannel | null
) {
  if (!channel || channel !== sharedChannel) {
    return;
  }

  listeners.clear();
  await teardownSharedChannel();
}
