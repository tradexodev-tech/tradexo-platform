-- Sprint 11 Step 5: recently_viewed_products table + RLS

CREATE TABLE public.recently_viewed_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recently_viewed_products_user_product_unique UNIQUE (user_id, product_id)
);

CREATE INDEX recently_viewed_products_user_id_idx
  ON public.recently_viewed_products (user_id);

CREATE INDEX recently_viewed_products_product_id_idx
  ON public.recently_viewed_products (product_id);

CREATE INDEX recently_viewed_products_viewed_at_idx
  ON public.recently_viewed_products (user_id, viewed_at DESC);

ALTER TABLE public.recently_viewed_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recently viewed products"
  ON public.recently_viewed_products
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recently viewed products"
  ON public.recently_viewed_products
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recently viewed products"
  ON public.recently_viewed_products
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recently viewed products"
  ON public.recently_viewed_products
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recently_viewed_products TO authenticated;
