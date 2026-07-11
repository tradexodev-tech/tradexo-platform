-- Sprint 15 Phase 2: Extend Event Management — types, virtual, registration, settings, storage

-- ============================================================
-- Extend events table
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'physical',
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS gps_latitude numeric,
  ADD COLUMN IF NOT EXISTS gps_longitude numeric,
  ADD COLUMN IF NOT EXISTS virtual_url text,
  ADD COLUMN IF NOT EXISTS virtual_platform text,
  ADD COLUMN IF NOT EXISTS virtual_lobby_url text,
  ADD COLUMN IF NOT EXISTS stream_provider text,
  ADD COLUMN IF NOT EXISTS chat_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS networking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_matchmaking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_mode text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS approval_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS registration_opening_time time,
  ADD COLUMN IF NOT EXISTS registration_closing_time time;

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_event_type_check CHECK (
    event_type IN ('physical', 'virtual', 'hybrid')
  );

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_registration_mode_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_registration_mode_check CHECK (
    registration_mode IN ('open', 'closed', 'paused', 'waitlist')
  );

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_capacity_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_capacity_check CHECK (
    capacity IS NULL OR capacity >= 0
  );

CREATE INDEX IF NOT EXISTS events_event_type_idx ON public.events (event_type);
CREATE INDEX IF NOT EXISTS events_registration_mode_idx ON public.events (registration_mode);

-- ============================================================
-- Extend event_documents with category
-- ============================================================

ALTER TABLE public.event_documents
  ADD COLUMN IF NOT EXISTS document_category text NOT NULL DEFAULT 'other';

ALTER TABLE public.event_documents
  DROP CONSTRAINT IF EXISTS event_documents_category_check;

ALTER TABLE public.event_documents
  ADD COLUMN IF NOT EXISTS storage_path text;

ALTER TABLE public.event_documents
  ADD CONSTRAINT event_documents_category_check CHECK (
    document_category IN (
      'brochure',
      'floor_plan',
      'exhibitor_manual',
      'visitor_guide',
      'sponsor_kit',
      'media_kit',
      'certificate',
      'other'
    )
  );

-- ============================================================
-- Extend event_registration types
-- ============================================================

ALTER TABLE public.event_registration
  DROP CONSTRAINT IF EXISTS event_registration_type_check;

ALTER TABLE public.event_registration
  ADD CONSTRAINT event_registration_type_check CHECK (
    registration_type IN (
      'visitor', 'buyer', 'supplier', 'exhibitor', 'media',
      'vip', 'speaker', 'student', 'organizer', 'sponsor', 'partner'
    )
  );

-- ============================================================
-- event_sponsors table (foundation)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  website text,
  tier text NOT NULL DEFAULT 'partner',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_sponsors_name_check CHECK (btrim(name) <> ''),
  CONSTRAINT event_sponsors_tier_check CHECK (
    tier IN ('title', 'platinum', 'gold', 'silver', 'bronze', 'partner', 'media')
  )
);

CREATE INDEX IF NOT EXISTS event_sponsors_event_id_idx ON public.event_sponsors (event_id);

ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view sponsors of published events"
  ON public.event_sponsors FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event sponsors"
  ON public.event_sponsors FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

GRANT SELECT ON public.event_sponsors TO anon, authenticated;
GRANT ALL ON public.event_sponsors TO authenticated;

-- ============================================================
-- Supabase Storage: event-media bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-media',
  'event-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for event-media
CREATE POLICY "Anyone can view event media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated users can upload event media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own event media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own event media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
