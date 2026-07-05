-- Sprint 8 Phase 3 – Inquiry timeline timestamp columns
-- Run in Supabase SQL Editor before relying on accurate Opened/Closed timeline times.

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

COMMENT ON COLUMN public.inquiries.read_at IS
  'When the supplier first opened the inquiry (New → Read).';

COMMENT ON COLUMN public.inquiries.closed_at IS
  'When the inquiry was marked closed.';

-- Optional: backfill read_at for inquiries already past "new" using updated_at as a best-effort estimate.
-- UPDATE public.inquiries
-- SET read_at = updated_at
-- WHERE status IN ('read', 'replied', 'closed')
--   AND read_at IS NULL;
