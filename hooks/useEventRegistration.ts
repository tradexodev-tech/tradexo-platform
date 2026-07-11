"use client";

import { useCallback, useEffect, useState } from "react";

import {
  cancelRegistration,
  fetchEventRegistrations,
  fetchUserRegistration,
  registerForEvent,
  updateRegistrationStatus,
} from "@/lib/events";
import type {
  CreateEventRegistrationInput,
  EventRegistration,
  EventRegistrationStatus,
} from "@/types/event";

type RegistrationToast = {
  type: "success" | "error";
  message: string;
};

export function useEventRegistration(eventId: string | null) {
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<RegistrationToast | null>(null);

  const showToast = useCallback((type: RegistrationToast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadRegistration = useCallback(async () => {
    if (!eventId) {
      setRegistration(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const { data, error } = await fetchUserRegistration(eventId);

    if (error) {
      setLoadError(error.message ?? "Failed to load registration.");
      setRegistration(null);
    } else {
      setRegistration(data);
    }

    setLoading(false);
  }, [eventId]);

  const loadRegistrations = useCallback(async () => {
    if (!eventId) return;

    const { data, error } = await fetchEventRegistrations(eventId);

    if (error) {
      setLoadError(error.message ?? "Failed to load registrations.");
      setRegistrations([]);
    } else {
      setRegistrations(data ?? []);
    }
  }, [eventId]);

  useEffect(() => {
    loadRegistration();
  }, [loadRegistration]);

  const submitRegistration = useCallback(
    async (input: CreateEventRegistrationInput) => {
      setSubmitting(true);
      const { data, error } = await registerForEvent(input);
      setSubmitting(false);

      if (error) {
        showToast("error", error.message ?? "Registration failed.");
        return { data: null, error };
      }

      setRegistration(data);
      showToast("success", "Registration submitted successfully.");
      return { data, error: null };
    },
    [showToast]
  );

  const handleCancel = useCallback(async () => {
    if (!eventId) return;

    setSubmitting(true);
    const { error } = await cancelRegistration(eventId);
    setSubmitting(false);

    if (error) {
      showToast("error", error.message ?? "Failed to cancel registration.");
      return;
    }

    setRegistration(null);
    showToast("success", "Registration cancelled.");
  }, [eventId, showToast]);

  const handleStatusUpdate = useCallback(
    async (registrationId: string, status: EventRegistrationStatus) => {
      const { data, error } = await updateRegistrationStatus(registrationId, status);

      if (error) {
        showToast("error", error.message ?? "Failed to update registration.");
        return;
      }

      if (data) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === registrationId ? data : r))
        );
        showToast("success", `Registration ${status}.`);
      }
    },
    [showToast]
  );

  return {
    registration,
    registrations,
    loading,
    submitting,
    loadError,
    toast,
    submitRegistration,
    handleCancel,
    handleStatusUpdate,
    loadRegistration,
    loadRegistrations,
    showToast,
  };
}
