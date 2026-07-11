-- Sprint 14 Step 1: rfqs table + RLS

CREATE TABLE public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  target_price numeric,
  currency text NOT NULL DEFAULT 'USD',
  delivery_country text NOT NULL,
  delivery_city text,
  industry text,
  industry_category text,
  budget_type text NOT NULL DEFAULT 'negotiable',
  required_before date,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'private',
  attachment_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rfqs_quantity_check CHECK (quantity > 0),
  CONSTRAINT rfqs_status_check CHECK (
    status IN ('draft', 'open', 'closed', 'cancelled')
  ),
  CONSTRAINT rfqs_visibility_check CHECK (
    visibility IN ('public', 'private')
  ),
  CONSTRAINT rfqs_budget_type_check CHECK (
    budget_type IN ('fixed', 'negotiable')
  )
);

CREATE INDEX rfqs_buyer_user_id_idx
  ON public.rfqs (buyer_user_id);

CREATE INDEX rfqs_status_idx
  ON public.rfqs (status);

CREATE INDEX rfqs_visibility_idx
  ON public.rfqs (visibility);

CREATE INDEX rfqs_created_at_idx
  ON public.rfqs (created_at DESC);

CREATE TRIGGER rfqs_set_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view own RFQs"
  ON public.rfqs
  FOR SELECT
  TO authenticated
  USING (buyer_user_id = auth.uid());

CREATE POLICY "Anyone can view public open RFQs"
  ON public.rfqs
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'open'
    AND visibility = 'public'
  );

CREATE POLICY "Buyers can insert own RFQs"
  ON public.rfqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    buyer_user_id = auth.uid()
    AND status = 'draft'
    AND title IS NOT NULL
    AND btrim(title) <> ''
    AND description IS NOT NULL
    AND btrim(description) <> ''
    AND quantity > 0
    AND delivery_country IS NOT NULL
    AND btrim(delivery_country) <> ''
  );

CREATE POLICY "Buyers can update own RFQs"
  ON public.rfqs
  FOR UPDATE
  TO authenticated
  USING (buyer_user_id = auth.uid())
  WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY "Buyers can delete own RFQs"
  ON public.rfqs
  FOR DELETE
  TO authenticated
  USING (buyer_user_id = auth.uid());

GRANT SELECT ON public.rfqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rfqs TO authenticated;
