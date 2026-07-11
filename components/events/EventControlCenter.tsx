"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Image,
  LayoutDashboard,
  Mail,
  MapPin,
  Megaphone,
  Mic,
  QrCode,
  Settings,
  Sparkles,
  Store,
  Users,
  Video,
} from "lucide-react";

import EventMediaUploader from "@/components/events/EventMediaUploader";
import EventStatusBadge from "@/components/events/EventStatusBadge";
import EventTypeFields from "@/components/events/EventTypeFields";
import FutureModulePlaceholder, {
  getFutureModule,
} from "@/components/events/FutureModulePlaceholder";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/hooks/useEvent";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import {
  addEventDocument,
  addEventGalleryItem,
  deleteEventDocument,
  deleteEventGalleryItem,
  duplicateEvent,
  unpublishEvent,
  updateEventRegistrationMode,
} from "@/lib/events";
import { cn } from "@/lib/utils";
import type { EventControlCenterSection, EventFormData } from "@/types/event";
import {
  EVENT_CONTROL_CENTER_SECTIONS,
  EVENT_DOCUMENT_CATEGORY_OPTIONS,
  EVENT_LANGUAGE_OPTIONS,
  EVENT_REGISTRATION_MODE_OPTIONS,
  EVENT_REGISTRATION_TYPE_OPTIONS,
  EVENT_VISIBILITY_OPTIONS,
  eventFormToCreateInput,
  eventToFormData,
} from "@/types/event";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

const SECTION_ICONS: Partial<Record<EventControlCenterSection, React.ComponentType<{ className?: string }>>> = {
  overview: LayoutDashboard,
  "basic-info": FileText,
  registration: Users,
  branding: Image,
  media: Image,
  schedule: Calendar,
  speakers: Mic,
  sponsors: Store,
  exhibitors: Store,
  documents: FileText,
  settings: Settings,
  registrations: Users,
  booths: MapPin,
  meetings: Video,
  visitors: Users,
  analytics: BarChart3,
  emails: Mail,
  announcements: Megaphone,
  ai: Sparkles,
};

type EventControlCenterProps = {
  eventId: string;
};

export default function EventControlCenter({ eventId }: EventControlCenterProps) {
  const [activeSection, setActiveSection] = useState<EventControlCenterSection>("overview");
  const {
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
    refresh,
    showToast,
  } = useEvent(eventId);

  const { registrations, loadRegistrations, handleStatusUpdate } =
    useEventRegistration(eventId);

  const [form, setForm] = useState<EventFormData | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  const updateField = useCallback(
    <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">{loadError ?? "Event not found."}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const formData = form ?? eventToFormData(event);

  const handleSave = async () => {
    const input = eventFormToCreateInput(formData);
    await saveEvent(input);
    setForm(null);
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    const { data, error } = await duplicateEvent(eventId);
    setDuplicating(false);
    if (error) {
      showToast("error", error.message ?? "Failed to duplicate.");
      return;
    }
    if (data) {
      showToast("success", "Event duplicated.");
      window.location.href = `/dashboard/events/${data.id}`;
    }
  };

  const handleUnpublish = async () => {
    const { error } = await unpublishEvent(eventId);
    if (error) showToast("error", error.message ?? "Failed to unpublish.");
    else {
      showToast("success", "Event unpublished.");
      await refresh();
    }
  };

  const futureSections = ["booths", "meetings", "visitors", "analytics", "emails", "announcements", "ai", "exhibitors"];

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full shrink-0 lg:w-56">
        <div className="sticky top-20 space-y-1 rounded-xl border bg-card p-2">
          {EVENT_CONTROL_CENTER_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.id] ?? FileText;
            const isFuture = futureSections.includes(section.id);
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSection(section.id);
                  if (section.id === "registrations") loadRegistrations();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{section.label}</span>
                {isFuture ? (
                  <span className="text-[10px] text-muted-foreground">Soon</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main panel */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header + Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
              <EventStatusBadge status={event.status} />
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {event.event_type}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">/events/{event.slug}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {event.status === "published" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.slug}`} target="_blank">
                  <ExternalLink className="size-4" />
                  Public Page
                </Link>
              </Button>
            ) : null}
            {event.status === "draft" ? (
              <Button size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? "Publishing…" : "Publish"}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleUnpublish}>
                Unpublish
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicating}>
              <Copy className="size-4" />
              Duplicate
            </Button>
            {event.status === "published" ? (
              <Button variant="outline" size="sm" onClick={handleArchive} disabled={archiving}>
                <Archive className="size-4" />
                Archive
              </Button>
            ) : null}
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <QrCode className="size-4" />
              QR
            </Button>
          </div>
        </div>

        {toast ? (
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              toast.type === "error"
                ? "border-destructive/30 bg-destructive/5 text-destructive"
                : "border-green-200 bg-green-50 text-green-800"
            )}
          >
            {toast.message}
          </div>
        ) : null}

        {/* Section content */}
        {activeSection === "overview" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Registrations" value={event.registration_count ?? 0} />
            <StatCard label="Confirmed" value={event.confirmed_registration_count ?? 0} />
            <StatCard label="Capacity" value={event.capacity ?? "∞"} />
            <StatCard
              label="Registration"
              value={event.registration_mode}
              capitalize
            />
            <StatCard label="Speakers" value={event.speakers.length} />
            <StatCard label="Sponsors" value={event.sponsors.length} />
            <StatCard label="Documents" value={event.documents.length} />
            <StatCard label="Gallery" value={event.gallery.length} />
          </div>
        ) : null}

        {activeSection === "basic-info" ? (
          <SectionPanel title="Basic Information" onSave={handleSave} saving={saving}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <input
                  value={formData.short_description}
                  onChange={(e) => updateField("short_description", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={inputClass + " min-h-[120px]"}
                  rows={5}
                />
              </div>
              <EventTypeFields form={formData} updateField={updateField} />
            </div>
          </SectionPanel>
        ) : null}

        {activeSection === "registration" ? (
          <SectionPanel title="Registration Settings" onSave={handleSave} saving={saving}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Registration Mode</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EVENT_REGISTRATION_MODE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      size="sm"
                      variant={formData.registration_mode === opt.value ? "default" : "outline"}
                      onClick={() => {
                        updateField("registration_mode", opt.value);
                        void updateEventRegistrationMode(eventId, opt.value);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.approval_required}
                  onChange={(e) => updateField("approval_required", e.target.checked)}
                />
                Approval Required
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Maximum Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => updateField("capacity", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Current Registrations</label>
                  <input
                    type="text"
                    value={event.registration_count ?? 0}
                    disabled
                    className={inputClass + " bg-muted"}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Registration Opens</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_start}
                    onChange={(e) => updateField("registration_start", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Registration Closes</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_end}
                    onChange={(e) => updateField("registration_end", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Opening Time</label>
                  <input
                    type="time"
                    value={formData.registration_opening_time}
                    onChange={(e) => updateField("registration_opening_time", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Closing Time</label>
                  <input
                    type="time"
                    value={formData.registration_closing_time}
                    onChange={(e) => updateField("registration_closing_time", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Enabled Registration Types</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EVENT_REGISTRATION_TYPE_OPTIONS.map((opt) => (
                    <span
                      key={opt.value}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                    >
                      {opt.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SectionPanel>
        ) : null}

        {activeSection === "media" ? (
          <SectionPanel title="Media" onSave={handleSave} saving={saving}>
            <div className="grid gap-4 sm:grid-cols-2">
              <EventMediaUploader
                eventId={eventId}
                kind="banner"
                label="Banner"
                currentUrl={formData.banner_image}
                onUploaded={(url) => {
                  updateField("banner_image", url);
                  void saveEvent({ banner_image: url });
                }}
                onRemoved={() => {
                  updateField("banner_image", "");
                  void saveEvent({ banner_image: "" });
                }}
              />
              <EventMediaUploader
                eventId={eventId}
                kind="logo"
                label="Logo"
                currentUrl={formData.logo}
                onUploaded={(url) => {
                  updateField("logo", url);
                  void saveEvent({ logo: url });
                }}
                onRemoved={() => {
                  updateField("logo", "");
                  void saveEvent({ logo: "" });
                }}
              />
            </div>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-semibold">Gallery</h4>
              <EventMediaUploader
                eventId={eventId}
                kind="gallery"
                label="Add Gallery Image"
                onUploaded={async (url) => {
                  await addEventGalleryItem(eventId, url);
                  await refresh();
                }}
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {event.gallery.map((item) => (
                  <div key={item.id} className="group relative overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt="" className="aspect-video w-full object-cover" />
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteEventGalleryItem(item.id);
                        await refresh();
                      }}
                      className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold">Documents</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {EVENT_DOCUMENT_CATEGORY_OPTIONS.map((cat) => (
                  <EventMediaUploader
                    key={cat.value}
                    eventId={eventId}
                    kind={cat.value}
                    label={cat.label}
                    previewAspect="document"
                    accept="application/pdf,image/*"
                    onUploaded={async (url, path) => {
                      await addEventDocument(eventId, {
                        title: cat.label,
                        file_url: url,
                        document_category: cat.value,
                        storage_path: path,
                        file_type: url.endsWith(".pdf") ? "application/pdf" : "image",
                      });
                      await refresh();
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {event.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{doc.title}</span>
                    <div className="flex gap-2">
                      <a href={doc.file_url} download className="text-blue-600 hover:underline">
                        Download
                      </a>
                      <button
                        type="button"
                        className="text-destructive hover:underline"
                        onClick={async () => {
                          await deleteEventDocument(doc.id);
                          await refresh();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionPanel>
        ) : null}

        {activeSection === "settings" ? (
          <SectionPanel title="Event Settings" onSave={handleSave} saving={saving}>
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold">Publishing & Visibility</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Visibility</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) =>
                        updateField("visibility", e.target.value as EventFormData["visibility"])
                      }
                      className={inputClass}
                    >
                      {EVENT_VISIBILITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => updateField("language", e.target.value)}
                      className={inputClass}
                    >
                      {EVENT_LANGUAGE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Timezone</label>
                    <input
                      value={formData.timezone}
                      onChange={(e) => updateField("timezone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold">SEO</h4>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>SEO Title</label>
                    <input
                      value={event.seo_title ?? ""}
                      onChange={(e) => void saveEvent({ seo_title: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>SEO Description</label>
                    <textarea
                      value={event.seo_description ?? ""}
                      onChange={(e) => void saveEvent({ seo_description: e.target.value })}
                      className={inputClass}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold">Contact & Social</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn</label>
                    <input
                      value={event.social_links.linkedin ?? ""}
                      onChange={(e) =>
                        void saveEvent({
                          social_links: { ...event.social_links, linkedin: e.target.value },
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold">Branding</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Primary Color</label>
                    <input
                      type="color"
                      value={event.branding.primary_color ?? "#2563eb"}
                      onChange={(e) =>
                        void saveEvent({
                          branding: { ...event.branding, primary_color: e.target.value },
                        })
                      }
                      className="h-10 w-full cursor-pointer rounded-lg border"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Secondary Color</label>
                    <input
                      type="color"
                      value={event.branding.secondary_color ?? "#1e40af"}
                      onChange={(e) =>
                        void saveEvent({
                          branding: { ...event.branding, secondary_color: e.target.value },
                        })
                      }
                      className="h-10 w-full cursor-pointer rounded-lg border"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Accent Color</label>
                    <input
                      type="color"
                      value={event.branding.accent_color ?? "#3b82f6"}
                      onChange={(e) =>
                        void saveEvent({
                          branding: { ...event.branding, accent_color: e.target.value },
                        })
                      }
                      className="h-10 w-full cursor-pointer rounded-lg border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionPanel>
        ) : null}

        {activeSection === "registrations" ? (
          <SectionPanel title="Registrations">
            {registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No registrations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="border-b">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{reg.full_name || reg.email}</p>
                        </td>
                        <td className="py-3 pr-4 capitalize">{reg.registration_type}</td>
                        <td className="py-3 pr-4 capitalize">{reg.status}</td>
                        <td className="py-3">
                          {reg.status === "pending" ? (
                            <div className="flex gap-1">
                              <Button
                                size="xs"
                                onClick={() => handleStatusUpdate(reg.id, "confirmed")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleStatusUpdate(reg.id, "waitlisted")}
                              >
                                Waitlist
                              </Button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionPanel>
        ) : null}

        {activeSection === "schedule" ? (
          <SectionPanel title="Schedule">
            {event.schedule.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedule items yet.</p>
            ) : (
              <div className="space-y-2">
                {event.schedule.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">
                      {new Date(item.start_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        ) : null}

        {activeSection === "speakers" ? (
          <SectionPanel title="Speakers">
            {event.speakers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No speakers added yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        ) : null}

        {activeSection === "sponsors" ? (
          <SectionPanel title="Sponsors & Partners">
            {event.sponsors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add sponsors from settings or via the sponsors API in a future release.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {event.sponsors.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3 text-center">
                    {s.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.logo_url} alt={s.name} className="mx-auto h-12 object-contain" />
                    ) : null}
                    <p className="mt-2 text-sm font-medium">{s.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{s.tier}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>
        ) : null}

        {activeSection === "documents" ? (
          <SectionPanel title="Documents">
            <p className="mb-4 text-sm text-muted-foreground">
              Upload documents from the Media section.
            </p>
            <div className="space-y-2">
              {event.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  download
                  className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted"
                >
                  <span>{doc.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {doc.document_category.replace("_", " ")}
                  </span>
                </a>
              ))}
            </div>
          </SectionPanel>
        ) : null}

        {activeSection === "branding" ? (
          <SectionPanel title="Branding" onSave={handleSave} saving={saving}>
            <p className="text-sm text-muted-foreground">
              Configure colors and brand identity in Settings → Branding, or use the Settings tab.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setActiveSection("settings")}
            >
              <Globe className="size-4" />
              Open Settings
            </Button>
          </SectionPanel>
        ) : null}

        {futureSections.includes(activeSection) ? (
          <FutureModulePlaceholder
            module={
              getFutureModule(activeSection) ?? {
                id: "booths",
                label: activeSection,
                description: "This module is part of the Tradexo Event OS roadmap.",
                status: "planned",
                dependsOn: [],
                routeSegment: activeSection,
              }
            }
          />
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  capitalize: cap,
}: {
  label: string;
  value: string | number;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", cap && "capitalize")}>{value}</p>
    </div>
  );
}

function SectionPanel({
  title,
  children,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {onSave ? (
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
