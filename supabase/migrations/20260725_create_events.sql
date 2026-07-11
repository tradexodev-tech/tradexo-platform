-- Sprint 15: Event Management Module — core tables + RLS

-- ============================================================
-- events
-- ============================================================

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  short_description text,
  description text,
  banner_image text,
  logo text,
  industry text,
  country text,
  city text,
  venue text,
  address text,
  start_date timestamptz,
  end_date timestamptz,
  registration_start timestamptz,
  registration_end timestamptz,
  timezone text NOT NULL DEFAULT 'UTC',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'private',
  organizer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  website text,
  email text,
  phone text,
  expected_visitors integer,
  expected_exhibitors integer,
  hall_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_slug_unique UNIQUE (slug),
  CONSTRAINT events_status_check CHECK (
    status IN ('draft', 'published', 'archived', 'cancelled')
  ),
  CONSTRAINT events_visibility_check CHECK (
    visibility IN ('public', 'private', 'unlisted')
  ),
  CONSTRAINT events_expected_visitors_check CHECK (
    expected_visitors IS NULL OR expected_visitors >= 0
  ),
  CONSTRAINT events_expected_exhibitors_check CHECK (
    expected_exhibitors IS NULL OR expected_exhibitors >= 0
  ),
  CONSTRAINT events_hall_count_check CHECK (
    hall_count IS NULL OR hall_count >= 0
  )
);

CREATE INDEX events_organizer_id_idx ON public.events (organizer_id);
CREATE INDEX events_status_idx ON public.events (status);
CREATE INDEX events_visibility_idx ON public.events (visibility);
CREATE INDEX events_start_date_idx ON public.events (start_date);
CREATE INDEX events_end_date_idx ON public.events (end_date);
CREATE INDEX events_industry_idx ON public.events (industry);
CREATE INDEX events_country_idx ON public.events (country);
CREATE INDEX events_created_at_idx ON public.events (created_at DESC);
CREATE INDEX events_slug_idx ON public.events (slug);

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- event_categories
-- ============================================================

CREATE TABLE public.event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_categories_name_check CHECK (btrim(name) <> '')
);

CREATE INDEX event_categories_event_id_idx ON public.event_categories (event_id);

-- ============================================================
-- event_gallery
-- ============================================================

CREATE TABLE public.event_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_gallery_image_url_check CHECK (btrim(image_url) <> '')
);

CREATE INDEX event_gallery_event_id_idx ON public.event_gallery (event_id);

-- ============================================================
-- event_documents
-- ============================================================

CREATE TABLE public.event_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_documents_title_check CHECK (btrim(title) <> ''),
  CONSTRAINT event_documents_file_url_check CHECK (btrim(file_url) <> '')
);

CREATE INDEX event_documents_event_id_idx ON public.event_documents (event_id);

-- ============================================================
-- event_halls
-- ============================================================

CREATE TABLE public.event_halls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  floor_number integer,
  hall_type text NOT NULL DEFAULT 'exhibition',
  capacity integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_halls_name_check CHECK (btrim(name) <> ''),
  CONSTRAINT event_halls_hall_type_check CHECK (
    hall_type IN ('exhibition', 'conference', 'meeting', 'outdoor', 'other')
  ),
  CONSTRAINT event_halls_capacity_check CHECK (
    capacity IS NULL OR capacity >= 0
  )
);

CREATE INDEX event_halls_event_id_idx ON public.event_halls (event_id);

-- ============================================================
-- event_booths
-- ============================================================

CREATE TABLE public.event_booths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  hall_id uuid REFERENCES public.event_halls (id) ON DELETE SET NULL,
  booth_number text,
  size_sqm numeric,
  status text NOT NULL DEFAULT 'available',
  price numeric,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_booths_status_check CHECK (
    status IN ('available', 'reserved', 'sold')
  ),
  CONSTRAINT event_booths_size_sqm_check CHECK (
    size_sqm IS NULL OR size_sqm >= 0
  ),
  CONSTRAINT event_booths_price_check CHECK (
    price IS NULL OR price >= 0
  )
);

CREATE INDEX event_booths_event_id_idx ON public.event_booths (event_id);
CREATE INDEX event_booths_hall_id_idx ON public.event_booths (hall_id);
CREATE INDEX event_booths_status_idx ON public.event_booths (status);

CREATE TRIGGER event_booths_set_updated_at
  BEFORE UPDATE ON public.event_booths
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- event_registration
-- ============================================================

CREATE TABLE public.event_registration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  registration_type text NOT NULL DEFAULT 'visitor',
  status text NOT NULL DEFAULT 'pending',
  company_name text,
  full_name text,
  email text NOT NULL,
  phone text,
  country text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_registration_type_check CHECK (
    registration_type IN ('visitor', 'exhibitor', 'buyer', 'supplier', 'speaker', 'media')
  ),
  CONSTRAINT event_registration_status_check CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'waitlisted')
  ),
  CONSTRAINT event_registration_email_check CHECK (btrim(email) <> ''),
  CONSTRAINT event_registration_unique_user_event UNIQUE (event_id, user_id)
);

CREATE INDEX event_registration_event_id_idx ON public.event_registration (event_id);
CREATE INDEX event_registration_user_id_idx ON public.event_registration (user_id);
CREATE INDEX event_registration_status_idx ON public.event_registration (status);
CREATE INDEX event_registration_created_at_idx ON public.event_registration (created_at DESC);

CREATE TRIGGER event_registration_set_updated_at
  BEFORE UPDATE ON public.event_registration
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- event_schedule
-- ============================================================

CREATE TABLE public.event_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text,
  hall_id uuid REFERENCES public.event_halls (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_schedule_title_check CHECK (btrim(title) <> '')
);

CREATE INDEX event_schedule_event_id_idx ON public.event_schedule (event_id);
CREATE INDEX event_schedule_start_time_idx ON public.event_schedule (start_time);

-- ============================================================
-- event_speakers
-- ============================================================

CREATE TABLE public.event_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  company text,
  bio text,
  photo_url text,
  speaker_type text NOT NULL DEFAULT 'panelist',
  social_linkedin text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_speakers_name_check CHECK (btrim(name) <> ''),
  CONSTRAINT event_speakers_type_check CHECK (
    speaker_type IN ('keynote', 'panelist', 'moderator', 'workshop', 'other')
  )
);

CREATE INDEX event_speakers_event_id_idx ON public.event_speakers (event_id);

-- ============================================================
-- Helper: check if user is event admin (profiles.role = 'Admin')
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_event_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'Admin'
  );
$$;

-- ============================================================
-- Helper: check if user owns an event
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_event_organizer(event_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.events
    WHERE id = event_uuid
      AND organizer_id = auth.uid()
  );
$$;

-- ============================================================
-- RLS: events
-- ============================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published public events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND visibility = 'public'
  );

CREATE POLICY "Anyone can view published unlisted events by direct access"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND visibility = 'unlisted'
  );

CREATE POLICY "Organizers can view own events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (organizer_id = auth.uid());

CREATE POLICY "Admins can view all events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (public.is_event_admin());

CREATE POLICY "Authenticated users can create events as organizer"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organizer_id = auth.uid()
    AND status = 'draft'
    AND btrim(title) <> ''
    AND btrim(slug) <> ''
  );

CREATE POLICY "Organizers can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Admins can update all events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.is_event_admin())
  WITH CHECK (public.is_event_admin());

CREATE POLICY "Organizers can delete own draft events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.is_event_admin());

-- ============================================================
-- RLS: child tables — public read for published events
-- ============================================================

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;

-- event_categories
CREATE POLICY "Public can view categories of published events"
  ON public.event_categories FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event categories"
  ON public.event_categories FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_gallery
CREATE POLICY "Public can view gallery of published events"
  ON public.event_gallery FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event gallery"
  ON public.event_gallery FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_documents
CREATE POLICY "Public can view documents of published events"
  ON public.event_documents FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event documents"
  ON public.event_documents FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_halls
CREATE POLICY "Public can view halls of published events"
  ON public.event_halls FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event halls"
  ON public.event_halls FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_booths
CREATE POLICY "Public can view booths of published events"
  ON public.event_booths FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event booths"
  ON public.event_booths FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_schedule
CREATE POLICY "Public can view schedule of published events"
  ON public.event_schedule FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event schedule"
  ON public.event_schedule FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- event_speakers
CREATE POLICY "Public can view speakers of published events"
  ON public.event_speakers FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id AND e.status = 'published'
      AND e.visibility IN ('public', 'unlisted')
  ));

CREATE POLICY "Organizers can manage event speakers"
  ON public.event_speakers FOR ALL TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

-- ============================================================
-- RLS: event_registration
-- ============================================================

ALTER TABLE public.event_registration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON public.event_registration FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organizers can view registrations for own events"
  ON public.event_registration FOR SELECT TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin());

CREATE POLICY "Authenticated users can register for published events"
  ON public.event_registration FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND btrim(email) <> ''
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.status = 'published'
        AND e.visibility IN ('public', 'unlisted')
    )
  );

CREATE POLICY "Users can update own registrations"
  ON public.event_registration FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can update registrations for own events"
  ON public.event_registration FOR UPDATE TO authenticated
  USING (public.is_event_organizer(event_id) OR public.is_event_admin())
  WITH CHECK (public.is_event_organizer(event_id) OR public.is_event_admin());

CREATE POLICY "Users can cancel own registrations"
  ON public.event_registration FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- Grants
-- ============================================================

GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

GRANT SELECT ON public.event_categories TO anon, authenticated;
GRANT ALL ON public.event_categories TO authenticated;

GRANT SELECT ON public.event_gallery TO anon, authenticated;
GRANT ALL ON public.event_gallery TO authenticated;

GRANT SELECT ON public.event_documents TO anon, authenticated;
GRANT ALL ON public.event_documents TO authenticated;

GRANT SELECT ON public.event_halls TO anon, authenticated;
GRANT ALL ON public.event_halls TO authenticated;

GRANT SELECT ON public.event_booths TO anon, authenticated;
GRANT ALL ON public.event_booths TO authenticated;

GRANT SELECT ON public.event_schedule TO anon, authenticated;
GRANT ALL ON public.event_schedule TO authenticated;

GRANT SELECT ON public.event_speakers TO anon, authenticated;
GRANT ALL ON public.event_speakers TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registration TO authenticated;
