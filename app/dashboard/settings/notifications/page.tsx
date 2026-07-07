"use client";

import NotificationPreferences from "@/components/settings/NotificationPreferences";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

export default function NotificationPreferencesPage() {
  const {
    preferences,
    loading,
    savingKey,
    error,
    successMessage,
    setPreference,
  } = useNotificationPreferences();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">Dashboard Settings</p>
        <h2 className="text-2xl font-bold text-foreground">
          Notification Preferences
        </h2>
        <p className="mt-1 text-muted-foreground">
          Manage how you receive email and in-app notifications for important
          Tradexo activity.
        </p>
      </div>

      <NotificationPreferences
        preferences={preferences}
        loading={loading}
        savingKey={savingKey}
        error={error}
        successMessage={successMessage}
        onPreferenceChange={(key, value) => {
          void setPreference(key, value);
        }}
      />
    </div>
  );
}
