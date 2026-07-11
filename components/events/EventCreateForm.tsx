"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import EventMediaUploader from "@/components/events/EventMediaUploader";
import EventTypeFields from "@/components/events/EventTypeFields";
import { createEvent, updateEvent } from "@/lib/events";
import { cn } from "@/lib/utils";
import type { Event, EventCreateStep, EventFormData, EventType } from "@/types/event";
import {
  EMPTY_EVENT_FORM,
  EVENT_CREATE_STEPS,
  EVENT_REGISTRATION_MODE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  EVENT_VISIBILITY_OPTIONS,
  eventFormToCreateInput,
  eventToFormData,
  slugifyEventTitle,
  validateEventFormStep,
} from "@/types/event";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

type EventCreateFormProps = {
  existingEvent?: Event | null;
};

export default function EventCreateForm({ existingEvent }: EventCreateFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<EventCreateStep>(1);
  const [form, setForm] = useState<EventFormData>(
    existingEvent ? eventToFormData(existingEvent) : EMPTY_EVENT_FORM
  );
  const [eventId, setEventId] = useState<string | null>(existingEvent?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateField = useCallback(
    <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "title" && !prev.slug) {
          next.slug = slugifyEventTitle(value as string);
        }
        return next;
      });
    },
    []
  );

  const saveDraft = useCallback(async (silent = false) => {
    if (!form.title.trim()) return;

    if (silent) setAutosaving(true);
    else setSaving(true);
    setError(null);

    const input = eventFormToCreateInput(form);

    let result;
    if (eventId) {
      result = await updateEvent(eventId, input);
    } else {
      result = await createEvent(input);
      if (result.data) setEventId(result.data.id);
    }

    if (silent) setAutosaving(false);
    else setSaving(false);

    if (result.error) {
      if (!silent) setError(result.error.message ?? "Failed to save.");
      return false;
    }

    setLastSaved(new Date());
    return true;
  }, [form, eventId]);

  useEffect(() => {
    if (!form.title.trim()) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      void saveDraft(true);
    }, 3000);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [form, saveDraft]);

  const goToStep = (step: EventCreateStep) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setError(null);
      return;
    }

    for (let s = currentStep; s < step; s++) {
      const validationError = validateEventFormStep(s as EventCreateStep, form);
      if (validationError) {
        setError(validationError);
        setCurrentStep(s as EventCreateStep);
        return;
      }
    }

    setError(null);
    setCurrentStep(step);
  };

  const handleNext = async () => {
    const validationError = validateEventFormStep(currentStep, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const saved = await saveDraft();
    if (!saved) return;

    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as EventCreateStep);
      setError(null);
    }
  };

  const handlePublish = async () => {
    const validationError = validateEventFormStep(4, form);
    if (validationError) {
      setError(validationError);
      setCurrentStep(4);
      return;
    }

    setSaving(true);
    setError(null);

    const input = eventFormToCreateInput(form);

    let id = eventId;
    if (!id) {
      const createResult = await createEvent(input);
      if (createResult.error || !createResult.data) {
        setSaving(false);
        setError(createResult.error?.message ?? "Failed to create event.");
        return;
      }
      id = createResult.data.id;
      setEventId(id);
    } else {
      const updateResult = await updateEvent(id, input);
      if (updateResult.error) {
        setSaving(false);
        setError(updateResult.error.message ?? "Failed to save event.");
        return;
      }
    }

    const publishResult = await updateEvent(id, {
      status: "published",
      visibility: form.visibility,
    });

    setSaving(false);

    if (publishResult.error) {
      setError(publishResult.error.message ?? "Failed to publish event.");
      return;
    }

    router.push(`/dashboard/events/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {EVENT_CREATE_STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : currentStep > step.id
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="size-4" /> : step.id}
              </button>
              {index < EVENT_CREATE_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    currentStep > step.id ? "bg-green-300" : "bg-muted"
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <p className="font-medium text-foreground">
            {EVENT_CREATE_STEPS[currentStep - 1].label}
          </p>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {EVENT_CREATE_STEPS.length} —{" "}
            {EVENT_CREATE_STEPS[currentStep - 1].description}
          </p>
        </div>
        {autosaving ? (
          <p className="mt-1 text-center text-xs text-muted-foreground">Autosaving…</p>
        ) : lastSaved ? (
          <p className="mt-1 text-center text-xs text-green-600">
            Draft saved at {lastSaved.toLocaleTimeString()}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Step content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {currentStep === 1 ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Event Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={inputClass}
                placeholder="Global Trade Expo 2026"
              />
            </div>
            <div>
              <label className={labelClass}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className={inputClass}
                placeholder="global-trade-expo-2026"
              />
            </div>
            <div>
              <label className={labelClass}>Short Description *</label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => updateField("short_description", e.target.value)}
                className={inputClass}
                placeholder="A brief tagline for your event"
              />
            </div>
            <div>
              <label className={labelClass}>Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={inputClass + " min-h-[120px] resize-y"}
                rows={5}
                placeholder="Detailed event description…"
              />
            </div>
            <div>
              <label className={labelClass}>Event Type *</label>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("event_type", option.value as EventType)}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-all",
                      form.event_type === option.value
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20"
                        : "hover:border-muted-foreground/40"
                    )}
                  >
                    <p className="font-medium">{option.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <EventTypeFields form={form} updateField={updateField} showTypeSelector={false} />
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Start Date *</label>
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End Date *</label>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Registration Opens</label>
                <input
                  type="datetime-local"
                  value={form.registration_start}
                  onChange={(e) => updateField("registration_start", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Registration Closes</label>
                <input
                  type="datetime-local"
                  value={form.registration_end}
                  onChange={(e) => updateField("registration_end", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
                className={inputClass}
                placeholder="UTC"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Registration Mode</label>
              <select
                value={form.registration_mode}
                onChange={(e) =>
                  updateField(
                    "registration_mode",
                    e.target.value as EventFormData["registration_mode"]
                  )
                }
                className={inputClass}
              >
                {EVENT_REGISTRATION_MODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.approval_required}
                onChange={(e) => updateField("approval_required", e.target.checked)}
              />
              Approval Required
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Maximum Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Expected Visitors</label>
                <input
                  type="number"
                  min="0"
                  value={form.expected_visitors}
                  onChange={(e) => updateField("expected_visitors", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Expected Exhibitors</label>
                <input
                  type="number"
                  min="0"
                  value={form.expected_exhibitors}
                  onChange={(e) => updateField("expected_exhibitors", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hall Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.hall_count}
                  onChange={(e) => updateField("hall_count", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Contact Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-4">
            {eventId ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <EventMediaUploader
                  eventId={eventId}
                  kind="banner"
                  label="Banner"
                  currentUrl={form.banner_image}
                  onUploaded={(url) => updateField("banner_image", url)}
                  onRemoved={() => updateField("banner_image", "")}
                />
                <EventMediaUploader
                  eventId={eventId}
                  kind="logo"
                  label="Logo"
                  currentUrl={form.logo}
                  onUploaded={(url) => updateField("logo", url)}
                  onRemoved={() => updateField("logo", "")}
                />
              </div>
            ) : (
              <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Save your draft first (click Next on step 1) to enable file uploads. Gallery and
                documents can be managed from the Event Control Center after creation.
              </p>
            )}
          </div>
        ) : null}

        {currentStep === 6 ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  updateField("visibility", e.target.value as EventFormData["visibility"])
                }
                className={inputClass}
              >
                {EVENT_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium text-foreground">Review</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Title</dt>
                  <dd className="font-medium">{form.title || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium capitalize">{form.event_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">
                    {form.event_type === "virtual"
                      ? form.virtual_platform || form.virtual_url || "Virtual"
                      : [form.venue, form.city, form.country].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dates</dt>
                  <dd className="font-medium">
                    {form.start_date && form.end_date
                      ? `${form.start_date} – ${form.end_date}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="font-medium capitalize">{form.visibility}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goToStep((currentStep - 1) as EventCreateStep)}
          disabled={currentStep === 1 || saving}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => saveDraft()} disabled={saving}>
            {saving ? "Saving…" : "Save Draft"}
          </Button>

          {currentStep < 6 ? (
            <Button onClick={handleNext} disabled={saving}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={saving}>
              {saving ? "Publishing…" : "Publish Event"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
