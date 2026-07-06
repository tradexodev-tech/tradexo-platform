import {
  attachMarketplaceCompanyInfo,
  fetchMarketplaceCompaniesByUserIds,
  mapPublishedProduct,
  type MarketplaceProduct,
} from "@/lib/product-public";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

const RECENTLY_VIEWED_STORE_LIMIT = 20;
const RECENTLY_VIEWED_DISPLAY_LIMIT = 8;

export type RecentlyViewedProduct = MarketplaceProduct;

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

async function trimRecentlyViewedProducts(userId: string) {
  const { data, error } = await supabase
    .from("recently_viewed_products")
    .select("id")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .range(RECENTLY_VIEWED_STORE_LIMIT, RECENTLY_VIEWED_STORE_LIMIT + 200);

  if (error || !data?.length) {
    return { error };
  }

  const staleIds = data.map((row) => row.id as string);

  const { error: deleteError } = await supabase
    .from("recently_viewed_products")
    .delete()
    .in("id", staleIds);

  return { error: deleteError };
}

export async function trackRecentlyViewedProduct(productId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { error: upsertError } = await supabase
    .from("recently_viewed_products")
    .upsert(
      {
        user_id: userId,
        product_id: productId,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,product_id" }
    );

  if (upsertError) {
    return { data: null, error: upsertError };
  }

  const { error: trimError } = await trimRecentlyViewedProducts(userId);

  if (trimError) {
    return { data: null, error: trimError };
  }

  return { data: true, error: null };
}

function orderProductsByViewedAt(
  products: Product[],
  viewedProductIds: string[]
) {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return viewedProductIds
    .map((productId) => productMap.get(productId))
    .filter((product): product is Product => Boolean(product));
}

export async function fetchRecentlyViewedProducts(options?: {
  excludeProductId?: string;
  limit?: number;
}) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: [], error: authError };
  }

  const limit = options?.limit ?? RECENTLY_VIEWED_DISPLAY_LIMIT;
  const fetchLimit = options?.excludeProductId ? limit + 1 : limit;

  const { data: viewRows, error: viewsError } = await supabase
    .from("recently_viewed_products")
    .select("product_id, viewed_at")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(fetchLimit);

  if (viewsError) {
    return { data: null, error: viewsError };
  }

  const productIds = (viewRows ?? [])
    .map((row) => row.product_id as string)
    .filter((productId) => productId !== options?.excludeProductId)
    .slice(0, limit);

  if (productIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("status", "published");

  if (productsError) {
    return { data: null, error: productsError };
  }

  const products = orderProductsByViewedAt(
    (productRows ?? []).map(mapPublishedProduct),
    productIds
  );

  if (products.length === 0) {
    return { data: [], error: null };
  }

  const supplierUserIds = [
    ...new Set(products.map((product) => product.user_id)),
  ];
  const companies = await fetchMarketplaceCompaniesByUserIds(supplierUserIds);

  return {
    data: attachMarketplaceCompanyInfo(products, companies),
    error: null,
  };
}
