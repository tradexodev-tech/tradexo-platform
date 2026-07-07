export const NOTIFICATION_TYPES = [
  "inquiry_received",
  "inquiry_replied",
  "product_published",
  "product_updated",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};
