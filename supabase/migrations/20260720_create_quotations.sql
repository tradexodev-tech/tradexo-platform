-- Sprint 14 Step 4: quotations table + RLS

CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs (id) ON DELETE CASCADE,
  supplier_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  lead_time text NOT NULL,
  message text NOT NULL,
  attachment_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quotations_price_check CHECK (price > 0),
  CONSTRAINT quotations_status_check CHECK (
    status IN ('submitted', 'accepted', 'rejected', 'withdrawn')
  ),
  CONSTRAINT quotations_rfq_supplier_unique UNIQUE (rfq_id, supplier_user_id)
);

CREATE INDEX quotations_rfq_id_idx
  ON public.quotations (rfq_id);

CREATE INDEX quotations_supplier_user_id_idx
  ON public.quotations (supplier_user_id);

CREATE INDEX quotations_status_idx
  ON public.quotations (status);

CREATE TRIGGER quotations_set_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view own quotations"
  ON public.quotations
  FOR SELECT
  TO authenticated
  USING (supplier_user_id = auth.uid());

CREATE POLICY "Buyers can view quotations for own RFQs"
  ON public.quotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rfqs
      WHERE rfqs.id = quotations.rfq_id
        AND rfqs.buyer_user_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can insert own quotations"
  ON public.quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_user_id = auth.uid()
    AND status = 'submitted'
    AND price > 0
    AND lead_time IS NOT NULL
    AND btrim(lead_time) <> ''
    AND message IS NOT NULL
    AND btrim(message) <> ''
  );

CREATE POLICY "Suppliers can update own quotations"
  ON public.quotations
  FOR UPDATE
  TO authenticated
  USING (supplier_user_id = auth.uid())
  WITH CHECK (supplier_user_id = auth.uid());

CREATE POLICY "Suppliers can delete own quotations"
  ON public.quotations
  FOR DELETE
  TO authenticated
  USING (supplier_user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
