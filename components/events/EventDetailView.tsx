"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Share2,
  Users,
} from "lucide-react";

import EventCard from "@/components/events/EventCard";
import EventCountdown from "@/components/events/EventCountdown";
import EventRegistrationDialog from "@/components/events/EventRegistrationDialog";
import { Button } from "@/components/ui/button";
import type { Event, EventWithRelations } from "@/types/event";
import {
  EVENT_REGISTRATION_MODE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  isRegistrationOpen,
  showsPhysicalFields,
  showsVirtualFields,
} from "@/types/event";

type EventDetailViewProps = {
  event: EventWithRelations;
  relatedEvents?: Event[];
  isAuthenticated?: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const FAQ_ITEMS = [
  {
    question: "Who can attend this event?",
    answer:
      "Buyers, suppliers, exhibitors, and visitors from the global trade community can register based on their business role.",
  },
  {
    question: "How do I register as an exhibitor?",
    answer:
      "Select the Exhibitor registration type during registration. Booth allocation and management will be available in a future release.",
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Registration details and pricing are managed by the event organizer. Contact them directly for fee information.",
  },
  {
    question: "Can I schedule meetings at the event?",
    answer:
      "Meeting scheduling and AI-powered matchmaking will be available in upcoming Tradexo Event OS releases.",
  },
];

export default function EventDetailView({
  event,
  relatedEvents = [],
  isAuthenticated = false,
}: EventDetailViewProps) {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const registrationAvailable = isRegistrationOpen(
    event,
    event.registration_count ?? 0
  );
  const eventTypeLabel =
    EVENT_TYPE_OPTIONS.find((o) => o.value === event.event_type)?.label ?? event.event_type;
  const registrationModeLabel =
    EVENT_REGISTRATION_MODE_OPTIONS.find((o) => o.value === event.registration_mode)?.label ??
    event.registration_mode;

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied to clipboard!");
      setTimeout(() => setShareMessage(null), 3000);
    } catch {
      setShareMessage("Unable to copy link.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 sm:h-80 lg:h-96">
        {event.banner_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.banner_image}
            alt={event.title}
            className="h-full w-full object-cover opacity-80"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end gap-4">
            {event.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.logo}
                alt=""
                className="size-16 rounded-xl border-2 border-white/20 bg-white object-contain p-1 sm:size-20"
              />
            ) : null}
            <div className="flex-1 text-white">
              {event.industry ? (
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur">
                  {event.industry}
                </span>
              ) : null}
              <span className="mb-2 ml-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium capitalize backdrop-blur">
                {eventTypeLabel}
              </span>
              <h1 className="text-2xl font-bold sm:text-4xl">{event.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {[event.venue, event.city, event.country].filter(Boolean).join(", ")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-4" />
                  {formatDateTime(event.start_date)}
                  {event.end_date ? ` – ${formatDateTime(event.end_date)}` : ""}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Industries & Stats */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">Event Highlights</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {event.expected_visitors != null ? (
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {event.expected_visitors.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Expected Visitors</p>
                  </div>
                ) : null}
                {event.registration_count != null ? (
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {event.registration_count.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </div>
                ) : null}
                {event.expected_exhibitors != null ? (
                  <div className="rounded-xl border bg-card p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {event.expected_exhibitors.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Exhibitors</p>
                  </div>
                ) : null}
                <div className="rounded-xl border bg-card p-4 text-center">
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {registrationModeLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">Registration Status</p>
                </div>
              </div>
              {event.categories.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Virtual / Networking */}
            {showsVirtualFields(event.event_type) ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Virtual Experience</h2>
                <div className="mt-3 rounded-xl border bg-card p-5">
                  {event.virtual_platform ? (
                    <p className="font-medium">Platform: {event.virtual_platform}</p>
                  ) : null}
                  {event.virtual_url ? (
                    <a
                      href={event.virtual_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="size-4" />
                      Join Virtual Event
                    </a>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.chat_enabled ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        Chat Enabled
                      </span>
                    ) : null}
                    {event.networking_enabled ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        Networking
                      </span>
                    ) : null}
                    {event.ai_matchmaking_enabled ? (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        AI Matchmaking
                      </span>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Sponsors */}
            {event.sponsors.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Sponsors & Partners</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {event.sponsors.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="flex flex-col items-center rounded-xl border bg-card p-4 text-center"
                    >
                      {sponsor.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.name}
                          className="h-12 object-contain"
                        />
                      ) : (
                        <p className="font-medium">{sponsor.name}</p>
                      )}
                      <p className="mt-2 text-xs capitalize text-muted-foreground">
                        {sponsor.tier}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* About */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">About</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                {event.description || event.short_description || "Details coming soon."}
              </p>
            </section>

            {/* Venue */}
            {showsPhysicalFields(event.event_type) ? (
            <section>
              <h2 className="text-xl font-semibold text-foreground">Venue</h2>
              <div className="mt-3 rounded-xl border bg-card p-5">
                <p className="font-medium text-foreground">{event.venue ?? "Venue TBA"}</p>
                {event.address ? (
                  <p className="mt-1 text-sm text-muted-foreground">{event.address}</p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  {[event.city, event.country].filter(Boolean).join(", ")}
                </p>
                <div className="mt-4 flex h-40 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  <MapPin className="mr-2 size-5" />
                  Map integration coming soon
                </div>
              </div>
            </section>
            ) : null}

            {/* Agenda alias for Schedule */}
            {event.schedule.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Agenda</h2>
                <div className="mt-3 space-y-3">
                  {event.schedule.map((item) => (
                    <div key={item.id} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="size-3.5" />
                          {formatDateTime(item.start_time)}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                      {item.location ? (
                        <p className="mt-1 text-xs text-muted-foreground">{item.location}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Speakers */}
            {event.speakers.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Speakers</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {event.speakers.map((speaker) => (
                    <div key={speaker.id} className="flex gap-4 rounded-xl border bg-card p-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {speaker.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={speaker.photo_url}
                            alt={speaker.name}
                            className="size-14 rounded-full object-cover"
                          />
                        ) : (
                          speaker.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{speaker.name}</p>
                        {speaker.title ? (
                          <p className="text-sm text-muted-foreground">{speaker.title}</p>
                        ) : null}
                        {speaker.company ? (
                          <p className="text-xs text-muted-foreground">{speaker.company}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Gallery */}
            {event.gallery.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Gallery</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {event.gallery.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-xl border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.caption ?? "Event gallery"}
                        className="aspect-video w-full object-cover"
                      />
                      {item.caption ? (
                        <p className="p-2 text-xs text-muted-foreground">{item.caption}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Documents */}
            {event.documents.length > 0 ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Documents</h2>
                <div className="mt-3 space-y-2">
                  {event.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-muted"
                    >
                      <FileText className="size-4 text-blue-600" />
                      <span className="flex-1 font-medium text-foreground">{doc.title}</span>
                      <Download className="size-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {/* FAQ */}
            <section>
              <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
              <div className="mt-3 space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="rounded-xl border bg-card p-4">
                    <summary className="cursor-pointer font-medium text-foreground">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Registration CTA */}
              <div id="register" className="rounded-xl border bg-card p-5 shadow-sm">
                <EventCountdown
                  targetDate={event.start_date}
                  label="Event starts in"
                />
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {event.expected_visitors != null ? (
                    <p className="inline-flex items-center gap-1.5">
                      <Users className="size-4" />
                      {event.expected_visitors.toLocaleString()} expected visitors
                    </p>
                  ) : null}
                  {event.registration_count != null ? (
                    <p>{event.registration_count} registered</p>
                  ) : null}
                  {event.capacity != null ? (
                    <p className="text-xs">
                      {(event.registration_count ?? 0)} / {event.capacity} capacity
                    </p>
                  ) : null}
                </div>
                {registrationAvailable ? (
                  <Button
                    className="mt-4 w-full"
                    onClick={() => setRegistrationOpen(true)}
                  >
                    Register Now
                  </Button>
                ) : (
                  <Button className="mt-4 w-full" disabled>
                    Registration Closed
                  </Button>
                )}
                {!isAuthenticated ? (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    <Link href="/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link>{" "}
                    to register
                  </p>
                ) : null}
              </div>

              {/* Organizer */}
              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold text-foreground">Organizer</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {event.email ? (
                    <a
                      href={`mailto:${event.email}`}
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      <Mail className="size-4" />
                      {event.email}
                    </a>
                  ) : null}
                  {event.phone ? (
                    <a
                      href={`tel:${event.phone}`}
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      <Phone className="size-4" />
                      {event.phone}
                    </a>
                  ) : null}
                  {event.website ? (
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                      Website
                    </a>
                  ) : null}
                  {event.social_links.linkedin ? (
                    <a
                      href={event.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  {event.social_links.twitter ? (
                    <a
                      href={event.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      Twitter / X
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border bg-card p-5">
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="size-4" />
                  Share Event
                </Button>
                {shareMessage ? (
                  <p className="mt-2 text-center text-xs text-green-600">{shareMessage}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground">Related Events</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((related) => (
                <EventCard key={related.id} event={related} showCountdown={false} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <EventRegistrationDialog
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
        event={event}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
