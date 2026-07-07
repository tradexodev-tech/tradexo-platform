"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchNotificationPreferences,
  updateNotificationPreference,
} from "@/lib/notification-preferences";
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from "@/types/notification-preferences";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<NotificationPreferenceKey | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchNotificationPreferences();

    if (fetchError) {
      setError(fetchError.message ?? "Failed to load notification preferences.");
      setPreferences(null);
      setLoading(false);
      return;
    }

    setPreferences(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadPreferences();

      if (cancelled) {
        return;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadPreferences]);

  const setPreference = useCallback(
    async (key: NotificationPreferenceKey, value: boolean) => {
      const currentPreferences = preferencesRef.current;

      if (!currentPreferences || savingKey) {
        return;
      }

      const previousPreferences = currentPreferences;

      setSavingKey(key);
      setError(null);
      setSuccessMessage(null);
      setPreferences({ ...currentPreferences, [key]: value });

      const { data, error: updateError } = await updateNotificationPreference(
        key,
        value
      );

      setSavingKey(null);

      if (updateError || !data) {
        setPreferences(previousPreferences);
        setError(
          updateError?.message ?? "Failed to save notification preference."
        );
        return;
      }

      setPreferences(data);
      setSuccessMessage("Preferences saved.");
    },
    [savingKey]
  );

  return useMemo(
    () => ({
      preferences,
      loading,
      savingKey,
      error,
      successMessage,
      setPreference,
      refresh: loadPreferences,
    }),
    [
      preferences,
      loading,
      savingKey,
      error,
      successMessage,
      setPreference,
      loadPreferences,
    ]
  );
}
