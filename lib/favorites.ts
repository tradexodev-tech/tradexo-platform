import { supabase } from "@/lib/supabase";

export type FavoriteProduct = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export const FAVORITE_GUEST_MESSAGE = "Please sign in to save products.";

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

function mapFavoriteProduct(row: Record<string, unknown>): FavoriteProduct {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    product_id: row.product_id as string,
    created_at: (row.created_at as string) ?? "",
  };
}

export async function fetchUserFavoriteProductIds(userId: string) {
  const { data, error } = await supabase
    .from("favorite_products")
    .select("product_id")
    .eq("user_id", userId);

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) => row.product_id as string),
    error: null,
  };
}

export async function fetchAuthenticatedFavoriteProductIds() {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) {
    return { data: [], error: authError };
  }

  return fetchUserFavoriteProductIds(userId);
}

export async function fetchFavoriteProductIdsForProducts(
  userId: string,
  productIds: string[]
) {
  if (productIds.length === 0) {
    return { data: [] as string[], error: null };
  }

  const { data, error } = await supabase
    .from("favorite_products")
    .select("product_id")
    .eq("user_id", userId)
    .in("product_id", productIds);

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) => row.product_id as string),
    error: null,
  };
}

export async function addFavoriteProduct(userId: string, productId: string) {
  const { data, error } = await supabase
    .from("favorite_products")
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select("id, user_id, product_id, created_at")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapFavoriteProduct(data), error: null };
}

export async function removeFavoriteProduct(userId: string, productId: string) {
  const { error } = await supabase
    .from("favorite_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    return { data: null, error };
  }

  return { data: true, error: null };
}

export async function toggleFavoriteProduct(
  userId: string,
  productId: string,
  isCurrentlyFavorited: boolean
) {
  if (isCurrentlyFavorited) {
    return removeFavoriteProduct(userId, productId);
  }

  return addFavoriteProduct(userId, productId);
}
