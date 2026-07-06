-- Sprint 11 Step 4: favorite_products table + RLS

CREATE TABLE public.favorite_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorite_products_user_product_unique UNIQUE (user_id, product_id)
);

CREATE INDEX favorite_products_user_id_idx
  ON public.favorite_products (user_id);

CREATE INDEX favorite_products_product_id_idx
  ON public.favorite_products (product_id);

CREATE INDEX favorite_products_created_at_idx
  ON public.favorite_products (created_at DESC);

ALTER TABLE public.favorite_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorite_products
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON public.favorite_products
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON public.favorite_products
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.favorite_products TO authenticated;
