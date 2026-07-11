"use client";

import { useCallback, useEffect, useState } from "react";

import {
  archiveEvent,
  duplicateEvent,
  fetchEventById,
  publishEvent,
  unpublishEvent,
  updateEvent,
} from "@/lib/events";
import type { EventWithRelations, UpdateEventInput } from "@/types/event";

type EventToast = {
  type: "success" | "error";
  message: string;
};

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<EventWithRelations | null>(null);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [toast, setToast] = useState<EventToast | null>(null);

  const showToast = useCallback((type: EventToast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const { data, error } = await fetchEventById(eventId);

    if (error) {
      setLoadError(error.message ?? "Failed to load event.");
      setEvent(null);
    } else {
      setEvent(data);
    }

    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const saveEvent = useCallback(
    async (input: UpdateEventInput) => {
      if (!eventId) return { data: null, error: { message: "No event selected." } };

      setSaving(true);
      const result = await updateEvent(eventId, input);
      setSaving(false);

      if (result.error) {
        showToast("error", result.error.message ?? "Failed to save event.");
      } else if (result.data) {
        showToast("success", "Event saved.");
        await loadEvent();
      }

      return result;
    },
    [eventId, loadEvent, showToast]
  );

  const handlePublish = useCallback(async () => {
    if (!eventId) return;

    setPublishing(true);
    const { data, error } = await publishEvent(eventId);
    setPublishing(false);

    if (error) {
      showToast("error", error.message ?? "Failed to publish event.");
      return;
    }

    showToast("success", `"${data?.title ?? "Event"}" published.`);
    await loadEvent();
  }, [eventId, loadEvent, showToast]);

  const handleArchive = useCallback(async () => {
    if (!eventId) return;

    setArchiving(true);
    const { data, error } = await archiveEvent(eventId);
    setArchiving(false);

    if (error) {
      showToast("error", error.message ?? "Failed to archive event.");
      return;
    }

    showToast("success", `"${data?.title ?? "Event"}" archived.`);
    await loadEvent();
  }, [eventId, loadEvent, showToast]);

  const handleUnpublish = useCallback(async () => {
    if (!eventId) return;

    setArchiving(true);
    const { data, error } = await unpublishEvent(eventId);
    setArchiving(false);

    if (error) {
      showToast("error", error.message ?? "Failed to unpublish event.");
      return;
    }

    showToast("success", `"${data?.title ?? "Event"}" unpublished.`);
    await loadEvent();
  }, [eventId, loadEvent, showToast]);

  const handleDuplicate = useCallback(async () => {
    if (!eventId) return { data: null, error: { message: "No event selected." } };
    return duplicateEvent(eventId);
  }, [eventId]);

  return {
    event,
    loading,
    loadError,
    saving,
    publishing,
    archiving,
    toast,
    saveEvent,
    handlePublish,
    handleArchive,
    handleUnpublish,
    handleDuplicate,
    refresh: loadEvent,
    showToast,
  };
}
