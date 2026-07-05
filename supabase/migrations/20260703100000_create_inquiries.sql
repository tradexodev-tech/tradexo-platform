-- Sprint 8 Phase 1: inquiries table + RLS

CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  supplier_user_id uuid NOT NULL,
  buyer_name text NOT NULL,
  buyer_company text,
  buyer_email text NOT NULL,
  buyer_country text,
  buyer_phone text,

  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  product_name text NOT NULL,

  message text NOT NULL,

  status text NOT NULL DEFAULT 'new'
    CONSTRAINT inquiries_status_check
    CHECK (status IN ('new', 'read', 'replied', 'closed'))
);

CREATE INDEX inquiries_supplier_user_id_idx
  ON public.inquiries (supplier_user_id);

CREATE INDEX inquiries_product_id_idx
  ON public.inquiries (product_id);

CREATE INDEX inquiries_status_idx
  ON public.inquiries (status);

CREATE INDEX inquiries_created_at_idx
  ON public.inquiries (created_at DESC);

-- Reuse shared updated_at handler if it already exists in Supabase; otherwise create it.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER inquiries_set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create inquiries"
  ON public.inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    supplier_user_id IS NOT NULL
    AND buyer_name IS NOT NULL
    AND btrim(buyer_name) <> ''
    AND buyer_email IS NOT NULL
    AND btrim(buyer_email) <> ''
    AND product_name IS NOT NULL
    AND btrim(product_name) <> ''
    AND message IS NOT NULL
    AND btrim(message) <> ''
    AND status = 'new'
  );

CREATE POLICY "Suppliers can view own inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (supplier_user_id = auth.uid());

CREATE POLICY "Suppliers can update own inquiry status"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (supplier_user_id = auth.uid())
  WITH CHECK (
    supplier_user_id = auth.uid()
    AND status IN ('new', 'read', 'replied', 'closed')
  );
