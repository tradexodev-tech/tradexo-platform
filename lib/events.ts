import { supabase } from "@/lib/supabase";
import type {
  CreateEventInput,
  CreateEventRegistrationInput,
  Event,
  EventBooth,
  EventCategory,
  EventDocument,
  EventDocumentCategory,
  EventFilters,
  EventGalleryItem,
  EventHall,
  EventRegistration,
  EventRegistrationMode,
  EventScheduleItem,
  EventSpeaker,
  EventSponsor,
  EventStatus,
  EventWithRelations,
  OrganizerEventStats,
  UpdateEventInput,
} from "@/types/event";
import {
  DEFAULT_EVENT_TIMEZONE,
  normalizeBoothStatus,
  normalizeEventStatus,
  normalizeEventType,
  normalizeEventVisibility,
  normalizeHallType,
  normalizeRegistrationMode,
  normalizeRegistrationStatus,
  normalizeRegistrationType,
  normalizeSpeakerType,
  parseEventBranding,
  parseEventSettings,
  parseEventSocialLinks,
  slugifyEventTitle,
  validateCreateEventInput,
  validateCreateRegistrationInput,
  validateEventStatusTransition,
  validateUpdateEventInput,
} from "@/types/event";

export type {
  CreateEventInput,
  CreateEventRegistrationInput,
  EventFilters,
  UpdateEventInput,
};

const DEFAULT_PAGE_SIZE = 12;

async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { userId: null, error: error ?? { message: "User not authenticated" } };
  }

  return { userId: user.id, error: null };
}

function optionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function optionalNumber(value?: number | null) {
  return value != null && !Number.isNaN(value) ? value : null;
}

export function buildPostgrestIlikePattern(search: string) {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '""')
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
  return `"%${escaped}%"`;
}

function mapEvent(row: Record<string, unknown>): Event {
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? "",
    title: (row.title as string) ?? "",
    short_description: (row.short_description as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    banner_image: (row.banner_image as string | null) ?? null,
    logo: (row.logo as string | null) ?? null,
    industry: (row.industry as string | null) ?? null,
    event_type: normalizeEventType(row.event_type),
    country: (row.country as string | null) ?? null,
    state: (row.state as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    venue: (row.venue as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    gps_latitude: row.gps_latitude != null ? Number(row.gps_latitude) : null,
    gps_longitude: row.gps_longitude != null ? Number(row.gps_longitude) : null,
    virtual_url: (row.virtual_url as string | null) ?? null,
    virtual_platform: (row.virtual_platform as string | null) ?? null,
    virtual_lobby_url: (row.virtual_lobby_url as string | null) ?? null,
    stream_provider: (row.stream_provider as string | null) ?? null,
    chat_enabled: Boolean(row.chat_enabled),
    networking_enabled: Boolean(row.networking_enabled),
    ai_matchmaking_enabled: Boolean(row.ai_matchmaking_enabled),
    start_date: (row.start_date as string | null) ?? null,
    end_date: (row.end_date as string | null) ?? null,
    registration_start: (row.registration_start as string | null) ?? null,
    registration_end: (row.registration_end as string | null) ?? null,
    registration_opening_time: (row.registration_opening_time as string | null) ?? null,
    registration_closing_time: (row.registration_closing_time as string | null) ?? null,
    registration_mode: normalizeRegistrationMode(row.registration_mode),
    approval_required: Boolean(row.approval_required),
    capacity: row.capacity != null ? Number(row.capacity) : null,
    timezone: (row.timezone as string) ?? DEFAULT_EVENT_TIMEZONE,
    language: (row.language as string) ?? "en",
    status: normalizeEventStatus(row.status),
    visibility: normalizeEventVisibility(row.visibility),
    organizer_id: (row.organizer_id as string) ?? "",
    website: (row.website as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    expected_visitors:
      row.expected_visitors != null ? Number(row.expected_visitors) : null,
    expected_exhibitors:
      row.expected_exhibitors != null ? Number(row.expected_exhibitors) : null,
    hall_count: row.hall_count != null ? Number(row.hall_count) : null,
    branding: parseEventBranding(row.branding),
    social_links: parseEventSocialLinks(row.social_links),
    settings_json: parseEventSettings(row.settings_json),
    seo_title: (row.seo_title as string | null) ?? null,
    seo_description: (row.seo_description as string | null) ?? null,
    seo_keywords: Array.isArray(row.seo_keywords)
      ? row.seo_keywords.filter((k): k is string => typeof k === "string")
      : [],
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function mapCategory(row: Record<string, unknown>): EventCategory {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    name: (row.name as string) ?? "",
    description: (row.description as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapGallery(row: Record<string, unknown>): EventGalleryItem {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    image_url: (row.image_url as string) ?? "",
    caption: (row.caption as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapDocument(row: Record<string, unknown>): EventDocument {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    title: (row.title as string) ?? "",
    file_url: (row.file_url as string) ?? "",
    file_type: (row.file_type as string | null) ?? null,
    document_category: (row.document_category as EventDocumentCategory) ?? "other",
    storage_path: (row.storage_path as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapSponsor(row: Record<string, unknown>): EventSponsor {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    name: (row.name as string) ?? "",
    logo_url: (row.logo_url as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    tier: (row.tier as EventSponsor["tier"]) ?? "partner",
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapHall(row: Record<string, unknown>): EventHall {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    name: (row.name as string) ?? "",
    description: (row.description as string | null) ?? null,
    floor_number: row.floor_number != null ? Number(row.floor_number) : null,
    hall_type: normalizeHallType(row.hall_type),
    capacity: row.capacity != null ? Number(row.capacity) : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapBooth(row: Record<string, unknown>): EventBooth {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    hall_id: (row.hall_id as string | null) ?? null,
    booth_number: (row.booth_number as string | null) ?? null,
    size_sqm: row.size_sqm != null ? Number(row.size_sqm) : null,
    status: normalizeBoothStatus(row.status),
    price: row.price != null ? Number(row.price) : null,
    currency: (row.currency as string) ?? "USD",
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function mapSchedule(row: Record<string, unknown>): EventScheduleItem {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    title: (row.title as string) ?? "",
    description: (row.description as string | null) ?? null,
    start_time: (row.start_time as string) ?? "",
    end_time: (row.end_time as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    hall_id: (row.hall_id as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapSpeaker(row: Record<string, unknown>): EventSpeaker {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    name: (row.name as string) ?? "",
    title: (row.title as string | null) ?? null,
    company: (row.company as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    photo_url: (row.photo_url as string | null) ?? null,
    speaker_type: normalizeSpeakerType(row.speaker_type),
    social_linkedin: (row.social_linkedin as string | null) ?? null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: (row.created_at as string) ?? "",
  };
}

function mapRegistration(row: Record<string, unknown>): EventRegistration {
  return {
    id: row.id as string,
    event_id: row.event_id as string,
    user_id: row.user_id as string,
    registration_type: normalizeRegistrationType(row.registration_type),
    status: normalizeRegistrationStatus(row.status),
    company_name: (row.company_name as string | null) ?? null,
    full_name: (row.full_name as string | null) ?? null,
    email: (row.email as string) ?? "",
    phone: (row.phone as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function buildCreatePayload(input: CreateEventInput, organizerId: string) {
  const slug = input.slug?.trim() || slugifyEventTitle(input.title);

  return {
    slug,
    title: input.title.trim(),
    short_description: optionalText(input.short_description),
    description: optionalText(input.description),
    banner_image: optionalText(input.banner_image),
    logo: optionalText(input.logo),
    industry: optionalText(input.industry),
    event_type: input.event_type ?? "physical",
    country: optionalText(input.country),
    state: optionalText(input.state),
    city: optionalText(input.city),
    venue: optionalText(input.venue),
    address: optionalText(input.address),
    gps_latitude: optionalNumber(input.gps_latitude),
    gps_longitude: optionalNumber(input.gps_longitude),
    virtual_url: optionalText(input.virtual_url),
    virtual_platform: optionalText(input.virtual_platform),
    virtual_lobby_url: optionalText(input.virtual_lobby_url),
    stream_provider: optionalText(input.stream_provider),
    chat_enabled: input.chat_enabled ?? false,
    networking_enabled: input.networking_enabled ?? false,
    ai_matchmaking_enabled: input.ai_matchmaking_enabled ?? false,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    registration_start: input.registration_start ?? null,
    registration_end: input.registration_end ?? null,
    registration_opening_time: input.registration_opening_time ?? null,
    registration_closing_time: input.registration_closing_time ?? null,
    registration_mode: input.registration_mode ?? "open",
    approval_required: input.approval_required ?? false,
    capacity: optionalNumber(input.capacity),
    timezone: input.timezone?.trim() || DEFAULT_EVENT_TIMEZONE,
    language: input.language?.trim() || "en",
    status: "draft" as const,
    visibility: input.visibility ?? "private",
    organizer_id: organizerId,
    website: optionalText(input.website),
    email: optionalText(input.email),
    phone: optionalText(input.phone),
    expected_visitors: optionalNumber(input.expected_visitors),
    expected_exhibitors: optionalNumber(input.expected_exhibitors),
    hall_count: optionalNumber(input.hall_count),
    branding: input.branding ?? {},
    social_links: input.social_links ?? {},
    settings_json: input.settings_json ?? {},
    seo_title: optionalText(input.seo_title),
    seo_description: optionalText(input.seo_description),
    seo_keywords: input.seo_keywords ?? [],
  };
}

function buildUpdatePayload(input: UpdateEventInput) {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.slug !== undefined) payload.slug = input.slug.trim();
  if (input.short_description !== undefined) {
    payload.short_description = optionalText(input.short_description);
  }
  if (input.description !== undefined) payload.description = optionalText(input.description);
  if (input.banner_image !== undefined) payload.banner_image = optionalText(input.banner_image);
  if (input.logo !== undefined) payload.logo = optionalText(input.logo);
  if (input.industry !== undefined) payload.industry = optionalText(input.industry);
  if (input.event_type !== undefined) payload.event_type = input.event_type;
  if (input.country !== undefined) payload.country = optionalText(input.country);
  if (input.state !== undefined) payload.state = optionalText(input.state);
  if (input.city !== undefined) payload.city = optionalText(input.city);
  if (input.venue !== undefined) payload.venue = optionalText(input.venue);
  if (input.address !== undefined) payload.address = optionalText(input.address);
  if (input.gps_latitude !== undefined) payload.gps_latitude = optionalNumber(input.gps_latitude);
  if (input.gps_longitude !== undefined) payload.gps_longitude = optionalNumber(input.gps_longitude);
  if (input.virtual_url !== undefined) payload.virtual_url = optionalText(input.virtual_url);
  if (input.virtual_platform !== undefined) {
    payload.virtual_platform = optionalText(input.virtual_platform);
  }
  if (input.virtual_lobby_url !== undefined) {
    payload.virtual_lobby_url = optionalText(input.virtual_lobby_url);
  }
  if (input.stream_provider !== undefined) {
    payload.stream_provider = optionalText(input.stream_provider);
  }
  if (input.chat_enabled !== undefined) payload.chat_enabled = input.chat_enabled;
  if (input.networking_enabled !== undefined) {
    payload.networking_enabled = input.networking_enabled;
  }
  if (input.ai_matchmaking_enabled !== undefined) {
    payload.ai_matchmaking_enabled = input.ai_matchmaking_enabled;
  }
  if (input.start_date !== undefined) payload.start_date = input.start_date;
  if (input.end_date !== undefined) payload.end_date = input.end_date;
  if (input.registration_start !== undefined) {
    payload.registration_start = input.registration_start;
  }
  if (input.registration_end !== undefined) payload.registration_end = input.registration_end;
  if (input.registration_opening_time !== undefined) {
    payload.registration_opening_time = input.registration_opening_time;
  }
  if (input.registration_closing_time !== undefined) {
    payload.registration_closing_time = input.registration_closing_time;
  }
  if (input.registration_mode !== undefined) payload.registration_mode = input.registration_mode;
  if (input.approval_required !== undefined) {
    payload.approval_required = input.approval_required;
  }
  if (input.capacity !== undefined) payload.capacity = optionalNumber(input.capacity);
  if (input.timezone !== undefined) {
    payload.timezone = input.timezone.trim() || DEFAULT_EVENT_TIMEZONE;
  }
  if (input.language !== undefined) payload.language = input.language.trim() || "en";
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  if (input.website !== undefined) payload.website = optionalText(input.website);
  if (input.email !== undefined) payload.email = optionalText(input.email);
  if (input.phone !== undefined) payload.phone = optionalText(input.phone);
  if (input.expected_visitors !== undefined) {
    payload.expected_visitors = optionalNumber(input.expected_visitors);
  }
  if (input.expected_exhibitors !== undefined) {
    payload.expected_exhibitors = optionalNumber(input.expected_exhibitors);
  }
  if (input.hall_count !== undefined) payload.hall_count = optionalNumber(input.hall_count);
  if (input.branding !== undefined) payload.branding = input.branding;
  if (input.social_links !== undefined) payload.social_links = input.social_links;
  if (input.settings_json !== undefined) payload.settings_json = input.settings_json;
  if (input.seo_title !== undefined) payload.seo_title = optionalText(input.seo_title);
  if (input.seo_description !== undefined) {
    payload.seo_description = optionalText(input.seo_description);
  }
  if (input.seo_keywords !== undefined) payload.seo_keywords = input.seo_keywords;
  if (input.status !== undefined) payload.status = input.status;

  return payload;
}

function applyEventFilters(
  query: ReturnType<typeof supabase.from>,
  filters: EventFilters,
  options?: { organizerOnly?: boolean; organizerId?: string }
) {
  let q = query;

  if (options?.organizerOnly && options.organizerId) {
    q = q.eq("organizer_id", options.organizerId);
  }

  if (filters.status && filters.status !== "all") {
    q = q.eq("status", filters.status);
  }

  if (filters.visibility && filters.visibility !== "all") {
    q = q.eq("visibility", filters.visibility);
  }

  if (filters.industry?.trim()) {
    q = q.eq("industry", filters.industry.trim());
  }

  if (filters.country?.trim()) {
    q = q.eq("country", filters.country.trim());
  }

  if (filters.city?.trim()) {
    q = q.eq("city", filters.city.trim());
  }

  const now = new Date().toISOString();

  if (filters.timeframe === "upcoming") {
    q = q.gte("end_date", now).eq("status", "published");
  } else if (filters.timeframe === "past") {
    q = q.lt("end_date", now);
  } else if (filters.timeframe === "featured") {
    q = q.eq("status", "published").eq("visibility", "public");
  }

  if (filters.search?.trim()) {
    const pattern = buildPostgrestIlikePattern(filters.search.trim());
    q = q.or(
      `title.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern},city.ilike.${pattern},country.ilike.${pattern},industry.ilike.${pattern}`
    );
  }

  const sort = filters.sort ?? "start_date_asc";
  switch (sort) {
    case "oldest":
      q = q.order("created_at", { ascending: true });
      break;
    case "start_date_desc":
      q = q.order("start_date", { ascending: false, nullsFirst: false });
      break;
    case "title":
      q = q.order("title", { ascending: true });
      break;
    case "newest":
    case "start_date_asc":
    default:
      q = q.order("start_date", { ascending: true, nullsFirst: false });
      break;
  }

  return q;
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    let query = supabase.from("events").select("id").eq("slug", slug).limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) return { slug, error };
    if (!data?.length) return { slug, error: null };

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function fetchEventRelations(eventId: string): Promise<{
  categories: EventCategory[];
  gallery: EventGalleryItem[];
  documents: EventDocument[];
  halls: EventHall[];
  booths: EventBooth[];
  schedule: EventScheduleItem[];
  speakers: EventSpeaker[];
  sponsors: EventSponsor[];
  registration_count: number;
  confirmed_registration_count: number;
}> {
  const [
    categoriesResult,
    galleryResult,
    documentsResult,
    hallsResult,
    boothsResult,
    scheduleResult,
    speakersResult,
    sponsorsResult,
    registrationsResult,
    confirmedResult,
  ] = await Promise.all([
    supabase.from("event_categories").select("*").eq("event_id", eventId).order("sort_order"),
    supabase.from("event_gallery").select("*").eq("event_id", eventId).order("sort_order"),
    supabase.from("event_documents").select("*").eq("event_id", eventId).order("sort_order"),
    supabase.from("event_halls").select("*").eq("event_id", eventId).order("sort_order"),
    supabase.from("event_booths").select("*").eq("event_id", eventId),
    supabase.from("event_schedule").select("*").eq("event_id", eventId).order("start_time"),
    supabase.from("event_speakers").select("*").eq("event_id", eventId).order("sort_order"),
    supabase.from("event_sponsors").select("*").eq("event_id", eventId).order("sort_order"),
    supabase
      .from("event_registration")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .neq("status", "cancelled"),
    supabase
      .from("event_registration")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "confirmed"),
  ]);

  return {
    categories: (categoriesResult.data ?? []).map((row) =>
      mapCategory(row as Record<string, unknown>)
    ),
    gallery: (galleryResult.data ?? []).map((row) =>
      mapGallery(row as Record<string, unknown>)
    ),
    documents: (documentsResult.data ?? []).map((row) =>
      mapDocument(row as Record<string, unknown>)
    ),
    halls: (hallsResult.data ?? []).map((row) => mapHall(row as Record<string, unknown>)),
    booths: (boothsResult.data ?? []).map((row) => mapBooth(row as Record<string, unknown>)),
    schedule: (scheduleResult.data ?? []).map((row) =>
      mapSchedule(row as Record<string, unknown>)
    ),
    speakers: (speakersResult.data ?? []).map((row) =>
      mapSpeaker(row as Record<string, unknown>)
    ),
    sponsors: (sponsorsResult.data ?? []).map((row) =>
      mapSponsor(row as Record<string, unknown>)
    ),
    registration_count: registrationsResult.count ?? 0,
    confirmed_registration_count: confirmedResult.count ?? 0,
  };
}

// ============================================================
// Public queries
// ============================================================

export async function fetchPublicEvents(filters: EventFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .eq("visibility", "public");

  query = applyEventFilters(query, filters);

  const { data, error, count } = await query.range(from, to);

  if (error) return { data: null, count: 0, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    count: count ?? 0,
    error: null,
  };
}

export async function fetchPublishedEventBySlug(slug: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .in("visibility", ["public", "unlisted"])
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  const event = mapEvent(data as Record<string, unknown>);
  const relations = await fetchEventRelations(event.id);

  return {
    data: { ...event, ...relations } as EventWithRelations,
    error: null,
  };
}

export async function fetchFeaturedEvents(limit = 6) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .gte("end_date", now)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchUpcomingEvents(limit = 12) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .gte("end_date", now)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchPastEvents(limit = 12) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .lt("end_date", now)
    .order("end_date", { ascending: false })
    .limit(limit);

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchRelatedEvents(
  event: Pick<Event, "id" | "industry" | "country">,
  limit = 4
) {
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .neq("id", event.id)
    .order("start_date", { ascending: true })
    .limit(limit);

  if (event.industry) {
    query = query.eq("industry", event.industry);
  } else if (event.country) {
    query = query.eq("country", event.country);
  }

  const { data, error } = await query;

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    error: null,
  };
}

// ============================================================
// Organizer CRUD
// ============================================================

export async function fetchOrganizerEvents(filters: EventFilters = {}) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, count: 0, error: authError };

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("events")
    .select("*", { count: "exact" });

  query = applyEventFilters(query, filters, {
    organizerOnly: true,
    organizerId: userId,
  });

  const { data, error, count } = await query.range(from, to);

  if (error) return { data: null, count: 0, error };

  return {
    data: (data ?? []).map((row) => mapEvent(row as Record<string, unknown>)),
    count: count ?? 0,
    error: null,
  };
}

export async function fetchDraftEvents() {
  return fetchOrganizerEvents({ status: "draft", pageSize: 50 });
}

export async function fetchEventById(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: { message: "Event not found" } };

  const event = mapEvent(data as Record<string, unknown>);

  if (event.organizer_id !== userId) {
    return { data: null, error: { message: "Unauthorized" } };
  }

  const relations = await fetchEventRelations(event.id);

  return {
    data: { ...event, ...relations } as EventWithRelations,
    error: null,
  };
}

export async function createEvent(input: CreateEventInput) {
  const validationError = validateCreateEventInput(input);
  if (validationError) return { data: null, error: { message: validationError } };

  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const baseSlug = input.slug?.trim() || slugifyEventTitle(input.title);
  const { slug, error: slugError } = await ensureUniqueSlug(baseSlug);
  if (slugError) return { data: null, error: slugError };

  const payload = buildCreatePayload({ ...input, slug }, userId);

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("*")
    .single();

  if (error) return { data: null, error };

  return { data: mapEvent(data as Record<string, unknown>), error: null };
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  const validationError = validateUpdateEventInput(input);
  if (validationError) return { data: null, error: { message: validationError } };

  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: existing, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("organizer_id", userId)
    .maybeSingle();

  if (fetchError) return { data: null, error: fetchError };
  if (!existing) return { data: null, error: { message: "Event not found" } };

  const current = mapEvent(existing as Record<string, unknown>);

  if (input.status) {
    const transitionError = validateEventStatusTransition(current.status, input.status);
    if (transitionError) return { data: null, error: { message: transitionError } };
  }

  const payload = buildUpdatePayload(input);

  if (input.slug !== undefined) {
    const { slug, error: slugError } = await ensureUniqueSlug(
      input.slug.trim(),
      id
    );
    if (slugError) return { data: null, error: slugError };
    payload.slug = slug;
  }

  const { data, error } = await supabase
    .from("events")
    .update(payload)
    .eq("id", id)
    .eq("organizer_id", userId)
    .select("*")
    .single();

  if (error) return { data: null, error };

  return { data: mapEvent(data as Record<string, unknown>), error: null };
}

export async function publishEvent(id: string) {
  return updateEvent(id, { status: "published" });
}

export async function archiveEvent(id: string) {
  return updateEvent(id, { status: "archived" });
}

export async function unpublishEvent(id: string) {
  return updateEvent(id, { status: "draft" });
}

export async function duplicateEvent(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: existing, error: fetchError } = await fetchEventById(id);
  if (fetchError || !existing) return { data: null, error: fetchError ?? { message: "Event not found" } };

  const baseSlug = `${existing.slug}-copy`;
  const { slug, error: slugError } = await ensureUniqueSlug(baseSlug);
  if (slugError) return { data: null, error: slugError };

  const input: CreateEventInput = {
    title: `${existing.title} (Copy)`,
    slug,
    short_description: existing.short_description ?? undefined,
    description: existing.description ?? undefined,
    banner_image: existing.banner_image ?? undefined,
    logo: existing.logo ?? undefined,
    industry: existing.industry ?? undefined,
    event_type: existing.event_type,
    country: existing.country ?? undefined,
    state: existing.state ?? undefined,
    city: existing.city ?? undefined,
    venue: existing.venue ?? undefined,
    address: existing.address ?? undefined,
    virtual_url: existing.virtual_url ?? undefined,
    virtual_platform: existing.virtual_platform ?? undefined,
    virtual_lobby_url: existing.virtual_lobby_url ?? undefined,
    stream_provider: existing.stream_provider ?? undefined,
    chat_enabled: existing.chat_enabled,
    networking_enabled: existing.networking_enabled,
    ai_matchmaking_enabled: existing.ai_matchmaking_enabled,
    start_date: existing.start_date,
    end_date: existing.end_date,
    registration_start: existing.registration_start,
    registration_end: existing.registration_end,
    registration_mode: existing.registration_mode,
    approval_required: existing.approval_required,
    capacity: existing.capacity,
    timezone: existing.timezone,
    language: existing.language,
    visibility: "private",
    website: existing.website ?? undefined,
    email: existing.email ?? undefined,
    phone: existing.phone ?? undefined,
    expected_visitors: existing.expected_visitors,
    expected_exhibitors: existing.expected_exhibitors,
    hall_count: existing.hall_count,
    branding: existing.branding,
    social_links: existing.social_links,
    settings_json: existing.settings_json,
    seo_title: existing.seo_title ?? undefined,
    seo_description: existing.seo_description ?? undefined,
    seo_keywords: existing.seo_keywords,
  };

  return createEvent(input);
}

export async function updateEventRegistrationMode(
  eventId: string,
  mode: EventRegistrationMode
) {
  return updateEvent(eventId, { registration_mode: mode });
}

export async function addEventGalleryItem(
  eventId: string,
  imageUrl: string,
  caption?: string
) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { count } = await supabase
    .from("event_gallery")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  const { data, error } = await supabase
    .from("event_gallery")
    .insert({
      event_id: eventId,
      image_url: imageUrl,
      caption: optionalText(caption),
      sort_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error) return { data: null, error };
  return { data: mapGallery(data as Record<string, unknown>), error: null };
}

export async function deleteEventGalleryItem(itemId: string) {
  const { error } = await supabase.from("event_gallery").delete().eq("id", itemId);
  return { error };
}

export async function addEventDocument(
  eventId: string,
  input: {
    title: string;
    file_url: string;
    file_type?: string;
    document_category: EventDocumentCategory;
    storage_path?: string;
  }
) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { count } = await supabase
    .from("event_documents")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  const { data, error } = await supabase
    .from("event_documents")
    .insert({
      event_id: eventId,
      title: input.title.trim(),
      file_url: input.file_url,
      file_type: optionalText(input.file_type),
      document_category: input.document_category,
      storage_path: optionalText(input.storage_path),
      sort_order: count ?? 0,
    })
    .select("*")
    .single();

  if (error) return { data: null, error };
  return { data: mapDocument(data as Record<string, unknown>), error: null };
}

export async function deleteEventDocument(documentId: string) {
  const { error } = await supabase.from("event_documents").delete().eq("id", documentId);
  return { error };
}

export async function deleteEvent(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("organizer_id", userId)
    .eq("status", "draft");

  return { error };
}

export async function fetchOrganizerStats(): Promise<{
  data: OrganizerEventStats | null;
  error: { message: string } | null;
}> {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const now = new Date().toISOString();

  const [eventsResult] = await Promise.all([
    supabase.from("events").select("*").eq("organizer_id", userId),
  ]);

  if (eventsResult.error) return { data: null, error: eventsResult.error };

  const events = (eventsResult.data ?? []).map((row) =>
    mapEvent(row as Record<string, unknown>)
  );

  const eventIds = events.map((e) => e.id);
  let recentRegistrations: EventRegistration[] = [];

  if (eventIds.length > 0) {
    const { data: regData } = await supabase
      .from("event_registration")
      .select("*")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false })
      .limit(10);

    recentRegistrations = (regData ?? []).map((row) =>
      mapRegistration(row as Record<string, unknown>)
    );
  }

  const stats: OrganizerEventStats = {
    total: events.length,
    upcoming: events.filter(
      (e) => e.status === "published" && e.end_date && e.end_date >= now
    ).length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
    archived: events.filter((e) => e.status === "archived").length,
    totalVisitors: events.reduce((sum, e) => sum + (e.expected_visitors ?? 0), 0),
    totalExhibitors: events.reduce((sum, e) => sum + (e.expected_exhibitors ?? 0), 0),
    recentRegistrations,
  };

  return { data: stats, error: null };
}

// ============================================================
// Registrations
// ============================================================

export async function registerForEvent(input: CreateEventRegistrationInput) {
  const validationError = validateCreateRegistrationInput(input);
  if (validationError) return { data: null, error: { message: validationError } };

  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: eventRow, error: eventError } = await supabase
    .from("events")
    .select("registration_mode, approval_required, capacity, status")
    .eq("id", input.event_id)
    .maybeSingle();

  if (eventError) return { data: null, error: eventError };
  if (!eventRow) return { data: null, error: { message: "Event not found" } };

  if (eventRow.registration_mode === "closed" || eventRow.registration_mode === "paused") {
    return { data: null, error: { message: "Registration is currently not open for this event." } };
  }

  const { count: regCount } = await supabase
    .from("event_registration")
    .select("id", { count: "exact", head: true })
    .eq("event_id", input.event_id)
    .neq("status", "cancelled");

  if (
    eventRow.registration_mode !== "waitlist" &&
    eventRow.capacity != null &&
    (regCount ?? 0) >= eventRow.capacity
  ) {
    return { data: null, error: { message: "This event has reached maximum capacity." } };
  }

  const initialStatus = eventRow.approval_required
    ? ("pending" as const)
    : eventRow.registration_mode === "waitlist"
      ? ("waitlisted" as const)
      : ("confirmed" as const);

  const payload = {
    event_id: input.event_id,
    user_id: userId,
    registration_type: input.registration_type ?? "visitor",
    status: initialStatus,
    company_name: optionalText(input.company_name),
    full_name: optionalText(input.full_name),
    email: input.email.trim(),
    phone: optionalText(input.phone),
    country: optionalText(input.country),
    notes: optionalText(input.notes),
  };

  const { data, error } = await supabase
    .from("event_registration")
    .insert(payload)
    .select("*")
    .single();

  if (error) return { data: null, error };

  return { data: mapRegistration(data as Record<string, unknown>), error: null };
}

export async function fetchUserRegistration(eventId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("event_registration")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return { data: mapRegistration(data as Record<string, unknown>), error: null };
}

export async function fetchEventRegistrations(eventId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) return { data: null, error: eventError };
  if (!event || event.organizer_id !== userId) {
    return { data: null, error: { message: "Unauthorized" } };
  }

  const { data, error } = await supabase
    .from("event_registration")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((row) => mapRegistration(row as Record<string, unknown>)),
    error: null,
  };
}

export async function cancelRegistration(eventId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { error: authError };

  const { error } = await supabase
    .from("event_registration")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  return { error };
}

export async function updateRegistrationStatus(
  registrationId: string,
  status: EventRegistration["status"]
) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (authError || !userId) return { data: null, error: authError };

  const { data: registration, error: fetchError } = await supabase
    .from("event_registration")
    .select("*")
    .eq("id", registrationId)
    .maybeSingle();

  if (fetchError) return { data: null, error: fetchError };
  if (!registration) return { data: null, error: { message: "Registration not found" } };

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", registration.event_id)
    .maybeSingle();

  if (eventError) return { data: null, error: eventError };
  if (!event || event.organizer_id !== userId) {
    return { data: null, error: { message: "Unauthorized" } };
  }

  const { data, error } = await supabase
    .from("event_registration")
    .update({ status })
    .eq("id", registrationId)
    .select("*")
    .single();

  if (error) return { data: null, error };

  return { data: mapRegistration(data as Record<string, unknown>), error: null };
}
