"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { getProfile } from "@/lib/auth";
import type { Event, EventRegistrationType } from "@/types/event";
import { EVENT_REGISTRATION_TYPE_OPTIONS } from "@/types/event";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type EventRegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
  event: Pick<Event, "id" | "title">;
  isAuthenticated?: boolean;
};

export default function EventRegistrationDialog({
  open,
  onClose,
  event,
  isAuthenticated = false,
}: EventRegistrationDialogProps) {
  const { registration, submitting, toast, submitRegistration, handleCancel } =
    useEventRegistration(open ? event.id : null);

  const [form, setForm] = useState({
    registration_type: "visitor" as EventRegistrationType,
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    country: "",
    notes: "",
  });

  useEffect(() => {
    if (!open || !isAuthenticated) return;

    getProfile().then(({ data }) => {
      if (data) {
        setForm((prev) => ({
          ...prev,
          full_name: (data.full_name as string) ?? prev.full_name,
          company_name: (data.company_name as string) ?? prev.company_name,
          email: (data.email as string) ?? prev.email,
          phone: (data.phone as string) ?? prev.phone,
          country: (data.country as string) ?? prev.country,
        }));
      }
    });
  }, [open, isAuthenticated]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitRegistration({
      event_id: event.id,
      registration_type: form.registration_type,
      full_name: form.full_name,
      company_name: form.company_name,
      email: form.email,
      phone: form.phone,
      country: form.country,
      notes: form.notes,
    });

    if (!result.error) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={submitting ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-title"
        className="relative w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <h2 id="registration-title" className="text-lg font-semibold text-foreground">
          Register for {event.title}
        </h2>

        {!isAuthenticated ? (
          <div className="mt-4 rounded-lg border bg-muted/50 p-4 text-sm">
            <p className="text-muted-foreground">
              Please sign in to register for this event.
            </p>
            <Button asChild className="mt-3">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        ) : registration && registration.status !== "cancelled" ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              You are registered as a{" "}
              <span className="font-medium capitalize">{registration.registration_type}</span>.
              Status: <span className="font-medium capitalize">{registration.status}</span>.
            </div>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel Registration
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Registration Type</label>
              <select
                value={form.registration_type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    registration_type: e.target.value as EventRegistrationType,
                  }))
                }
                className={inputClass}
                required
              >
                {EVENT_REGISTRATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Company</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, company_name: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className={inputClass}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className={inputClass + " min-h-[80px] resize-y"}
                rows={3}
              />
            </div>

            {toast ? (
              <p
                className={
                  toast.type === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-green-600"
                }
              >
                {toast.message}
              </p>
            ) : null}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Submitting…" : "Submit Registration"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
