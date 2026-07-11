export type EventStatus = "draft" | "published" | "archived" | "cancelled";

export type EventVisibility = "public" | "private" | "unlisted";

export type EventType = "physical" | "virtual" | "hybrid";

export type EventRegistrationMode = "open" | "closed" | "paused" | "waitlist";

export type EventDocumentCategory =
  | "brochure"
  | "floor_plan"
  | "exhibitor_manual"
  | "visitor_guide"
  | "sponsor_kit"
  | "media_kit"
  | "certificate"
  | "other";

export type EventSponsorTier =
  | "title"
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "partner"
  | "media";

export type EventBranding = {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
};

export type EventSocialLinks = {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
};

export type EventSEOSettings = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type EventEmailTemplates = {
  registration_confirmation?: string;
  registration_approved?: string;
  registration_waitlisted?: string;
  event_reminder?: string;
};

export type EventSettings = {
  seo?: EventSEOSettings;
  email_templates?: EventEmailTemplates;
  enabled_registration_types?: EventRegistrationType[];
  sponsors?: EventSponsor[];
  partners?: EventSponsor[];
  announcements?: { id: string; title: string; body: string; created_at: string }[];
};

export type EventRegistrationType =
  | "visitor"
  | "exhibitor"
  | "buyer"
  | "supplier"
  | "speaker"
  | "media"
  | "vip"
  | "student"
  | "organizer"
  | "sponsor"
  | "partner";

export type EventRegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "waitlisted";

export type EventHallType =
  | "exhibition"
  | "conference"
  | "meeting"
  | "outdoor"
  | "other";

export type EventSpeakerType =
  | "keynote"
  | "panelist"
  | "moderator"
  | "workshop"
  | "other";

export type EventBoothStatus = "available" | "reserved" | "sold";

export type EventSort = "newest" | "oldest" | "start_date_asc" | "start_date_desc" | "title";

export type EventSponsor = {
  id: string;
  event_id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  tier: EventSponsorTier;
  sort_order: number;
  created_at: string;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  banner_image: string | null;
  logo: string | null;
  industry: string | null;
  event_type: EventType;
  country: string | null;
  state: string | null;
  city: string | null;
  venue: string | null;
  address: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  virtual_url: string | null;
  virtual_platform: string | null;
  virtual_lobby_url: string | null;
  stream_provider: string | null;
  chat_enabled: boolean;
  networking_enabled: boolean;
  ai_matchmaking_enabled: boolean;
  start_date: string | null;
  end_date: string | null;
  registration_start: string | null;
  registration_end: string | null;
  registration_opening_time: string | null;
  registration_closing_time: string | null;
  registration_mode: EventRegistrationMode;
  approval_required: boolean;
  capacity: number | null;
  timezone: string;
  language: string;
  status: EventStatus;
  visibility: EventVisibility;
  organizer_id: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  expected_visitors: number | null;
  expected_exhibitors: number | null;
  hall_count: number | null;
  branding: EventBranding;
  social_links: EventSocialLinks;
  settings_json: EventSettings;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  created_at: string;
  updated_at: string;
};

export type EventCategory = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type EventGalleryItem = {
  id: string;
  event_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type EventDocument = {
  id: string;
  event_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  document_category: EventDocumentCategory;
  storage_path: string | null;
  sort_order: number;
  created_at: string;
};

export type EventHall = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  floor_number: number | null;
  hall_type: EventHallType;
  capacity: number | null;
  sort_order: number;
  created_at: string;
};

export type EventBooth = {
  id: string;
  event_id: string;
  hall_id: string | null;
  booth_number: string | null;
  size_sqm: number | null;
  status: EventBoothStatus;
  price: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type EventScheduleItem = {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  hall_id: string | null;
  sort_order: number;
  created_at: string;
};

export type EventSpeaker = {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  photo_url: string | null;
  speaker_type: EventSpeakerType;
  social_linkedin: string | null;
  sort_order: number;
  created_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  registration_type: EventRegistrationType;
  status: EventRegistrationStatus;
  company_name: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventWithRelations = Event & {
  categories: EventCategory[];
  gallery: EventGalleryItem[];
  documents: EventDocument[];
  halls: EventHall[];
  booths: EventBooth[];
  schedule: EventScheduleItem[];
  speakers: EventSpeaker[];
  sponsors: EventSponsor[];
  registration_count?: number;
  confirmed_registration_count?: number;
};

export type CreateEventInput = {
  title: string;
  slug?: string;
  short_description?: string;
  description?: string;
  banner_image?: string;
  logo?: string;
  industry?: string;
  event_type?: EventType;
  country?: string;
  state?: string;
  city?: string;
  venue?: string;
  address?: string;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
  virtual_url?: string;
  virtual_platform?: string;
  virtual_lobby_url?: string;
  stream_provider?: string;
  chat_enabled?: boolean;
  networking_enabled?: boolean;
  ai_matchmaking_enabled?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  registration_opening_time?: string | null;
  registration_closing_time?: string | null;
  registration_mode?: EventRegistrationMode;
  approval_required?: boolean;
  capacity?: number | null;
  timezone?: string;
  language?: string;
  visibility?: EventVisibility;
  website?: string;
  email?: string;
  phone?: string;
  expected_visitors?: number | null;
  expected_exhibitors?: number | null;
  hall_count?: number | null;
  branding?: EventBranding;
  social_links?: EventSocialLinks;
  settings_json?: EventSettings;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
};

export type UpdateEventInput = Partial<CreateEventInput> & {
  status?: EventStatus;
};

export type CreateEventRegistrationInput = {
  event_id: string;
  registration_type?: EventRegistrationType;
  company_name?: string;
  full_name?: string;
  email: string;
  phone?: string;
  country?: string;
  notes?: string;
};

export type EventFilters = {
  search?: string;
  status?: EventStatus | "all";
  visibility?: EventVisibility | "all";
  industry?: string;
  country?: string;
  city?: string;
  sort?: EventSort;
  page?: number;
  pageSize?: number;
  timeframe?: "all" | "upcoming" | "past" | "featured";
};

export type OrganizerEventStats = {
  total: number;
  upcoming: number;
  published: number;
  draft: number;
  archived: number;
  totalVisitors: number;
  totalExhibitors: number;
  recentRegistrations: EventRegistration[];
};

export const EVENT_TYPE_OPTIONS: { value: EventType; label: string; description: string }[] = [
  { value: "physical", label: "Physical Event", description: "In-person exhibition or conference" },
  { value: "virtual", label: "Virtual Event", description: "Online-only trade event" },
  { value: "hybrid", label: "Hybrid Event", description: "Combined physical and virtual experience" },
];

export const EVENT_REGISTRATION_MODE_OPTIONS: { value: EventRegistrationMode; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "paused", label: "Paused" },
  { value: "waitlist", label: "Waitlist" },
];

export const EVENT_DOCUMENT_CATEGORY_OPTIONS: {
  value: EventDocumentCategory;
  label: string;
}[] = [
  { value: "brochure", label: "Brochure PDF" },
  { value: "floor_plan", label: "Floor Plan" },
  { value: "exhibitor_manual", label: "Exhibitor Manual" },
  { value: "visitor_guide", label: "Visitor Guide" },
  { value: "sponsor_kit", label: "Sponsor Kit" },
  { value: "media_kit", label: "Media Kit" },
  { value: "certificate", label: "Certificates" },
  { value: "other", label: "Other" },
];

export const EVENT_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
] as const;

export const EVENT_CONTROL_CENTER_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "basic-info", label: "Basic Info" },
  { id: "registration", label: "Registration" },
  { id: "branding", label: "Branding" },
  { id: "media", label: "Media" },
  { id: "schedule", label: "Schedule" },
  { id: "speakers", label: "Speakers" },
  { id: "sponsors", label: "Sponsors" },
  { id: "exhibitors", label: "Exhibitors" },
  { id: "documents", label: "Documents" },
  { id: "settings", label: "Settings" },
  { id: "registrations", label: "Registrations" },
  { id: "booths", label: "Booths" },
  { id: "meetings", label: "Meetings" },
  { id: "visitors", label: "Visitors" },
  { id: "analytics", label: "Analytics" },
  { id: "emails", label: "Emails" },
  { id: "announcements", label: "Announcements" },
  { id: "ai", label: "AI" },
] as const;

export type EventControlCenterSection =
  (typeof EVENT_CONTROL_CENTER_SECTIONS)[number]["id"];

export const ORGANIZER_EVENT_TABS = [
  "overview",
  "basic-info",
  "registration",
  "branding",
  "media",
  "schedule",
  "speakers",
  "sponsors",
  "exhibitors",
  "documents",
  "analytics",
  "settings",
] as const;

export type OrganizerEventTab = (typeof ORGANIZER_EVENT_TABS)[number];

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "cancelled", label: "Cancelled" },
];

export const EVENT_VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
];

export const EVENT_REGISTRATION_TYPE_OPTIONS: {
  value: EventRegistrationType;
  label: string;
}[] = [
  { value: "visitor", label: "Visitor" },
  { value: "buyer", label: "Buyer" },
  { value: "supplier", label: "Supplier" },
  { value: "exhibitor", label: "Exhibitor" },
  { value: "media", label: "Media" },
  { value: "vip", label: "VIP" },
  { value: "speaker", label: "Speaker" },
  { value: "student", label: "Student" },
  { value: "organizer", label: "Organizer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "partner", label: "Partner" },
];

export const EVENT_HALL_TYPE_OPTIONS: { value: EventHallType; label: string }[] = [
  { value: "exhibition", label: "Exhibition" },
  { value: "conference", label: "Conference" },
  { value: "meeting", label: "Meeting" },
  { value: "outdoor", label: "Outdoor" },
  { value: "other", label: "Other" },
];

export const EVENT_SPEAKER_TYPE_OPTIONS: { value: EventSpeakerType; label: string }[] = [
  { value: "keynote", label: "Keynote" },
  { value: "panelist", label: "Panelist" },
  { value: "moderator", label: "Moderator" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

export const EVENT_SORT_OPTIONS: { value: EventSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "start_date_asc", label: "Start Date (Earliest)" },
  { value: "start_date_desc", label: "Start Date (Latest)" },
  { value: "title", label: "Title A–Z" },
];

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  search: "",
  status: "all",
  visibility: "all",
  industry: "",
  country: "",
  city: "",
  sort: "start_date_asc",
  page: 1,
  pageSize: 12,
  timeframe: "all",
};

export const DEFAULT_EVENT_TIMEZONE = "UTC";

export const EVENT_CREATE_STEPS = [
  { id: 1, label: "Basic Info", description: "Title, type, industry, and description" },
  { id: 2, label: "Venue", description: "Physical or virtual location details" },
  { id: 3, label: "Dates", description: "Event and registration dates" },
  { id: 4, label: "Registration", description: "Capacity, modes, and contact" },
  { id: 5, label: "Media", description: "Upload banner, logo, and files" },
  { id: 6, label: "Publish", description: "Visibility and review" },
] as const;

export type EventCreateStep = (typeof EVENT_CREATE_STEPS)[number]["id"];

export type EventFormData = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  industry: string;
  event_type: EventType;
  country: string;
  state: string;
  city: string;
  venue: string;
  address: string;
  gps_latitude: string;
  gps_longitude: string;
  virtual_url: string;
  virtual_platform: string;
  virtual_lobby_url: string;
  stream_provider: string;
  chat_enabled: boolean;
  networking_enabled: boolean;
  ai_matchmaking_enabled: boolean;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  registration_opening_time: string;
  registration_closing_time: string;
  registration_mode: EventRegistrationMode;
  approval_required: boolean;
  capacity: string;
  timezone: string;
  language: string;
  visibility: EventVisibility;
  website: string;
  email: string;
  phone: string;
  expected_visitors: string;
  expected_exhibitors: string;
  hall_count: string;
  banner_image: string;
  logo: string;
};

export const EMPTY_EVENT_FORM: EventFormData = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  industry: "",
  event_type: "physical",
  country: "",
  state: "",
  city: "",
  venue: "",
  address: "",
  gps_latitude: "",
  gps_longitude: "",
  virtual_url: "",
  virtual_platform: "",
  virtual_lobby_url: "",
  stream_provider: "",
  chat_enabled: false,
  networking_enabled: false,
  ai_matchmaking_enabled: false,
  start_date: "",
  end_date: "",
  registration_start: "",
  registration_end: "",
  registration_opening_time: "",
  registration_closing_time: "",
  registration_mode: "open",
  approval_required: false,
  capacity: "",
  timezone: DEFAULT_EVENT_TIMEZONE,
  language: "en",
  visibility: "private",
  website: "",
  email: "",
  phone: "",
  expected_visitors: "",
  expected_exhibitors: "",
  hall_count: "",
  banner_image: "",
  logo: "",
};

const EVENT_STATUSES: EventStatus[] = ["draft", "published", "archived", "cancelled"];
const EVENT_VISIBILITIES: EventVisibility[] = ["public", "private", "unlisted"];
const EVENT_TYPES: EventType[] = ["physical", "virtual", "hybrid"];
const REGISTRATION_MODES: EventRegistrationMode[] = ["open", "closed", "paused", "waitlist"];
const REGISTRATION_TYPES: EventRegistrationType[] = [
  "visitor", "exhibitor", "buyer", "supplier", "speaker", "media",
  "vip", "student", "organizer", "sponsor", "partner",
];
const REGISTRATION_STATUSES: EventRegistrationStatus[] = [
  "pending", "confirmed", "cancelled", "waitlisted",
];
const HALL_TYPES: EventHallType[] = ["exhibition", "conference", "meeting", "outdoor", "other"];
const SPEAKER_TYPES: EventSpeakerType[] = ["keynote", "panelist", "moderator", "workshop", "other"];
const BOOTH_STATUSES: EventBoothStatus[] = ["available", "reserved", "sold"];

export function normalizeEventType(value: unknown): EventType {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return EVENT_TYPES.includes(normalized as EventType)
    ? (normalized as EventType)
    : "physical";
}

export function normalizeRegistrationMode(value: unknown): EventRegistrationMode {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return REGISTRATION_MODES.includes(normalized as EventRegistrationMode)
    ? (normalized as EventRegistrationMode)
    : "open";
}

export function parseEventBranding(value: unknown): EventBranding {
  if (!value || typeof value !== "object") return {};
  const obj = value as Record<string, unknown>;
  return {
    primary_color: typeof obj.primary_color === "string" ? obj.primary_color : undefined,
    secondary_color: typeof obj.secondary_color === "string" ? obj.secondary_color : undefined,
    accent_color: typeof obj.accent_color === "string" ? obj.accent_color : undefined,
    font_family: typeof obj.font_family === "string" ? obj.font_family : undefined,
    custom_css: typeof obj.custom_css === "string" ? obj.custom_css : undefined,
  };
}

export function parseEventSocialLinks(value: unknown): EventSocialLinks {
  if (!value || typeof value !== "object") return {};
  const obj = value as Record<string, unknown>;
  const link = (key: string) => (typeof obj[key] === "string" ? obj[key] : undefined);
  return {
    linkedin: link("linkedin"),
    twitter: link("twitter"),
    facebook: link("facebook"),
    instagram: link("instagram"),
    youtube: link("youtube"),
    tiktok: link("tiktok"),
  };
}

export function parseEventSettings(value: unknown): EventSettings {
  if (!value || typeof value !== "object") return {};
  return value as EventSettings;
}

export function showsPhysicalFields(eventType: EventType): boolean {
  return eventType === "physical" || eventType === "hybrid";
}

export function showsVirtualFields(eventType: EventType): boolean {
  return eventType === "virtual" || eventType === "hybrid";
}

export function normalizeEventStatus(value: unknown): EventStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return EVENT_STATUSES.includes(normalized as EventStatus)
    ? (normalized as EventStatus)
    : "draft";
}

export function normalizeEventVisibility(value: unknown): EventVisibility {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return EVENT_VISIBILITIES.includes(normalized as EventVisibility)
    ? (normalized as EventVisibility)
    : "private";
}

export function normalizeRegistrationType(value: unknown): EventRegistrationType {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return REGISTRATION_TYPES.includes(normalized as EventRegistrationType)
    ? (normalized as EventRegistrationType)
    : "visitor";
}

export function normalizeRegistrationStatus(value: unknown): EventRegistrationStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return REGISTRATION_STATUSES.includes(normalized as EventRegistrationStatus)
    ? (normalized as EventRegistrationStatus)
    : "pending";
}

export function normalizeHallType(value: unknown): EventHallType {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return HALL_TYPES.includes(normalized as EventHallType)
    ? (normalized as EventHallType)
    : "exhibition";
}

export function normalizeSpeakerType(value: unknown): EventSpeakerType {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SPEAKER_TYPES.includes(normalized as EventSpeakerType)
    ? (normalized as EventSpeakerType)
    : "panelist";
}

export function normalizeBoothStatus(value: unknown): EventBoothStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return BOOTH_STATUSES.includes(normalized as EventBoothStatus)
    ? (normalized as EventBoothStatus)
    : "available";
}

export function slugifyEventTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isEventUpcoming(event: Pick<Event, "start_date" | "end_date">): boolean {
  const now = Date.now();
  const end = event.end_date ? new Date(event.end_date).getTime() : null;
  const start = event.start_date ? new Date(event.start_date).getTime() : null;

  if (end && !Number.isNaN(end)) return end >= now;
  if (start && !Number.isNaN(start)) return start >= now;
  return false;
}

export function isEventPast(event: Pick<Event, "end_date" | "start_date">): boolean {
  const now = Date.now();
  const end = event.end_date ? new Date(event.end_date).getTime() : null;
  const start = event.start_date ? new Date(event.start_date).getTime() : null;

  if (end && !Number.isNaN(end)) return end < now;
  if (start && !Number.isNaN(start)) return start < now;
  return false;
}

export function isRegistrationOpen(
  event: Pick<
    Event,
    | "registration_start"
    | "registration_end"
    | "registration_mode"
    | "status"
    | "capacity"
  >,
  currentCount = 0
): boolean {
  if (event.status !== "published") return false;
  if (event.registration_mode === "closed" || event.registration_mode === "paused") {
    return false;
  }

  const now = Date.now();
  const start = event.registration_start ? new Date(event.registration_start).getTime() : null;
  const end = event.registration_end ? new Date(event.registration_end).getTime() : null;

  if (start && !Number.isNaN(start) && now < start) return false;
  if (end && !Number.isNaN(end) && now > end) return false;

  if (
    event.registration_mode !== "waitlist" &&
    event.capacity != null &&
    currentCount >= event.capacity
  ) {
    return false;
  }

  return true;
}

export function validateEventStatusTransition(
  current: EventStatus,
  next: EventStatus
): string | null {
  if (current === next) return null;

  const allowed: Record<EventStatus, EventStatus[]> = {
    draft: ["published", "cancelled"],
    published: ["archived", "cancelled", "draft"],
    archived: ["published", "draft"],
    cancelled: ["draft"],
  };

  if (!allowed[current]?.includes(next)) {
    return `Cannot change event status from ${current} to ${next}.`;
  }

  return null;
}

export function validateCreateEventInput(input: CreateEventInput): string | null {
  if (!input.title?.trim()) return "Event title is required.";
  if (input.slug !== undefined && !input.slug.trim()) return "Event slug cannot be empty.";
  if (input.expected_visitors != null && input.expected_visitors < 0) {
    return "Expected visitors must be zero or greater.";
  }
  if (input.expected_exhibitors != null && input.expected_exhibitors < 0) {
    return "Expected exhibitors must be zero or greater.";
  }
  if (input.hall_count != null && input.hall_count < 0) {
    return "Hall count must be zero or greater.";
  }
  return validateEventDates(input);
}

export function validateUpdateEventInput(input: UpdateEventInput): string | null {
  if (input.title !== undefined && !input.title.trim()) return "Event title is required.";
  if (input.slug !== undefined && !input.slug.trim()) return "Event slug cannot be empty.";
  return validateEventDates(input);
}

function validateEventDates(
  input: Pick<CreateEventInput, "start_date" | "end_date" | "registration_start" | "registration_end">
): string | null {
  if (input.start_date && input.end_date) {
    const start = new Date(input.start_date).getTime();
    const end = new Date(input.end_date).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      return "End date must be on or after start date.";
    }
  }

  if (input.registration_start && input.registration_end) {
    const regStart = new Date(input.registration_start).getTime();
    const regEnd = new Date(input.registration_end).getTime();
    if (!Number.isNaN(regStart) && !Number.isNaN(regEnd) && regEnd < regStart) {
      return "Registration end must be on or after registration start.";
    }
  }

  return null;
}

export function validateEventFormStep(step: EventCreateStep, form: EventFormData): string | null {
  switch (step) {
    case 1:
      if (!form.title.trim()) return "Title is required.";
      if (!form.short_description.trim()) return "Short description is required.";
      return null;
    case 2:
      if (showsPhysicalFields(form.event_type)) {
        if (!form.country.trim()) return "Country is required for physical events.";
        if (!form.city.trim()) return "City is required for physical events.";
        if (!form.venue.trim()) return "Venue is required for physical events.";
      }
      if (showsVirtualFields(form.event_type)) {
        if (!form.virtual_url.trim() && !form.virtual_platform.trim()) {
          return "Virtual platform or event URL is required for virtual events.";
        }
      }
      return null;
    case 3:
      if (!form.start_date) return "Start date is required.";
      if (!form.end_date) return "End date is required.";
      return validateEventDates({
        start_date: form.start_date,
        end_date: form.end_date,
        registration_start: form.registration_start || null,
        registration_end: form.registration_end || null,
      });
    case 4:
      if (!form.email.trim()) return "Contact email is required.";
      if (form.capacity && Number(form.capacity) < 0) return "Capacity must be zero or greater.";
      return null;
    default:
      return null;
  }
}

export function validateCreateRegistrationInput(
  input: CreateEventRegistrationInput
): string | null {
  if (!input.event_id?.trim()) return "Event is required.";
  if (!input.email?.trim()) return "Email is required.";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(input.email.trim())) return "Enter a valid email address.";
  return null;
}

export function eventFormToCreateInput(form: EventFormData): CreateEventInput {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || slugifyEventTitle(form.title),
    short_description: form.short_description.trim() || undefined,
    description: form.description.trim() || undefined,
    industry: form.industry.trim() || undefined,
    event_type: form.event_type,
    country: form.country.trim() || undefined,
    state: form.state.trim() || undefined,
    city: form.city.trim() || undefined,
    venue: form.venue.trim() || undefined,
    address: form.address.trim() || undefined,
    gps_latitude: form.gps_latitude ? Number(form.gps_latitude) : null,
    gps_longitude: form.gps_longitude ? Number(form.gps_longitude) : null,
    virtual_url: form.virtual_url.trim() || undefined,
    virtual_platform: form.virtual_platform.trim() || undefined,
    virtual_lobby_url: form.virtual_lobby_url.trim() || undefined,
    stream_provider: form.stream_provider.trim() || undefined,
    chat_enabled: form.chat_enabled,
    networking_enabled: form.networking_enabled,
    ai_matchmaking_enabled: form.ai_matchmaking_enabled,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    registration_start: form.registration_start || null,
    registration_end: form.registration_end || null,
    registration_opening_time: form.registration_opening_time || null,
    registration_closing_time: form.registration_closing_time || null,
    registration_mode: form.registration_mode,
    approval_required: form.approval_required,
    capacity: form.capacity ? Number(form.capacity) : null,
    timezone: form.timezone.trim() || DEFAULT_EVENT_TIMEZONE,
    language: form.language.trim() || "en",
    visibility: form.visibility,
    website: form.website.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    expected_visitors: form.expected_visitors ? Number(form.expected_visitors) : null,
    expected_exhibitors: form.expected_exhibitors ? Number(form.expected_exhibitors) : null,
    hall_count: form.hall_count ? Number(form.hall_count) : null,
    banner_image: form.banner_image.trim() || undefined,
    logo: form.logo.trim() || undefined,
  };
}

export function eventToFormData(event: Event): EventFormData {
  return {
    title: event.title,
    slug: event.slug,
    short_description: event.short_description ?? "",
    description: event.description ?? "",
    industry: event.industry ?? "",
    event_type: event.event_type,
    country: event.country ?? "",
    state: event.state ?? "",
    city: event.city ?? "",
    venue: event.venue ?? "",
    address: event.address ?? "",
    gps_latitude: event.gps_latitude?.toString() ?? "",
    gps_longitude: event.gps_longitude?.toString() ?? "",
    virtual_url: event.virtual_url ?? "",
    virtual_platform: event.virtual_platform ?? "",
    virtual_lobby_url: event.virtual_lobby_url ?? "",
    stream_provider: event.stream_provider ?? "",
    chat_enabled: event.chat_enabled,
    networking_enabled: event.networking_enabled,
    ai_matchmaking_enabled: event.ai_matchmaking_enabled,
    start_date: event.start_date ? event.start_date.slice(0, 16) : "",
    end_date: event.end_date ? event.end_date.slice(0, 16) : "",
    registration_start: event.registration_start ? event.registration_start.slice(0, 16) : "",
    registration_end: event.registration_end ? event.registration_end.slice(0, 16) : "",
    registration_opening_time: event.registration_opening_time ?? "",
    registration_closing_time: event.registration_closing_time ?? "",
    registration_mode: event.registration_mode,
    approval_required: event.approval_required,
    capacity: event.capacity?.toString() ?? "",
    timezone: event.timezone,
    language: event.language,
    visibility: event.visibility,
    website: event.website ?? "",
    email: event.email ?? "",
    phone: event.phone ?? "",
    expected_visitors: event.expected_visitors?.toString() ?? "",
    expected_exhibitors: event.expected_exhibitors?.toString() ?? "",
    hall_count: event.hall_count?.toString() ?? "",
    banner_image: event.banner_image ?? "",
    logo: event.logo ?? "",
  };
}
