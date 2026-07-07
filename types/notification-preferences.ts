export type NotificationPreferenceKey =
  | "email_new_inquiry"
  | "email_inquiry_reply"
  | "email_product_published"
  | "email_system"
  | "inapp_new_inquiry"
  | "inapp_inquiry_reply"
  | "inapp_product_published"
  | "inapp_system";

export type NotificationPreferences = {
  user_id: string;
  email_new_inquiry: boolean;
  email_inquiry_reply: boolean;
  email_product_published: boolean;
  email_system: boolean;
  inapp_new_inquiry: boolean;
  inapp_inquiry_reply: boolean;
  inapp_product_published: boolean;
  inapp_system: boolean;
  created_at: string;
  updated_at: string;
};

export const NOTIFICATION_PREFERENCE_DEFAULTS: Omit<
  NotificationPreferences,
  "user_id" | "created_at" | "updated_at"
> = {
  email_new_inquiry: true,
  email_inquiry_reply: true,
  email_product_published: true,
  email_system: true,
  inapp_new_inquiry: true,
  inapp_inquiry_reply: true,
  inapp_product_published: true,
  inapp_system: true,
};

export type NotificationPreferenceOption = {
  key: NotificationPreferenceKey;
  label: string;
};

export const EMAIL_NOTIFICATION_OPTIONS: NotificationPreferenceOption[] = [
  { key: "email_new_inquiry", label: "New Inquiry" },
  { key: "email_inquiry_reply", label: "Inquiry Reply" },
  { key: "email_product_published", label: "Product Published" },
  { key: "email_system", label: "System Updates" },
];

export const INAPP_NOTIFICATION_OPTIONS: NotificationPreferenceOption[] = [
  { key: "inapp_new_inquiry", label: "New Inquiry" },
  { key: "inapp_inquiry_reply", label: "Inquiry Reply" },
  { key: "inapp_product_published", label: "Product Published" },
  { key: "inapp_system", label: "System Updates" },
];
