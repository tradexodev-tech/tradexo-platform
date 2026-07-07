import { supabase } from "./supabase";
import { queueProductPublishedEmail } from "@/lib/email";
import type {
  Product,
  ProductFormInput,
  ProductImage,
  ProductStatus,
} from "@/types/product";
import { normalizeProductStatus, parseSpecifications, parseVariants } from "./product-utils";
import { parseProductImages } from "@/types/product";

const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    company_id: (row.company_id as string | null) ?? null,
    product_name: (row.product_name as string) ?? "",
    product_category: (row.product_category as string) ?? "",
    short_description: (row.short_description as string) ?? "",
    full_description: (row.full_description as string) ?? "",
    hs_code: (row.hs_code as string) ?? "",
    country_of_origin: (row.country_of_origin as string) ?? "",
    brand_name: (row.brand_name as string) ?? "",
    model_number: (row.model_number as string) ?? "",
    moq: (row.moq as string) ?? "",
    production_capacity: (row.production_capacity as string) ?? "",
    unit: (row.unit as string) ?? "",
    price_on_request: (row.price_on_request as boolean) ?? true,
    currency: (row.currency as string) ?? "USD",
    price: row.price != null ? Number(row.price) : null,
    lead_time: (row.lead_time as string) ?? "",
    product_images: parseProductImages(row.product_images),
    product_video: (row.product_video as string) ?? "",
    certifications: (row.certifications as string) ?? "",
    specifications: parseSpecifications(row.specifications),
    variants: parseVariants(row.variants),
    seo_title: (row.seo_title as string) ?? "",
    seo_description: (row.seo_description as string) ?? "",
    meta_keywords: (row.meta_keywords as string) ?? "",
    slug: (row.slug as string) ?? "",
    status: normalizeProductStatus(row.status),
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function formFields(input: ProductFormInput) {
  return {
    product_name: input.product_name,
    product_category: input.product_category,
    short_description: input.short_description,
    full_description: input.full_description,
    hs_code: input.hs_code,
    country_of_origin: input.country_of_origin,
    brand_name: input.brand_name,
    model_number: input.model_number,
    moq: input.moq,
    production_capacity: input.production_capacity,
    unit: input.unit,
    price_on_request: input.price_on_request,
    currency: input.currency,
    price: input.price_on_request ? null : input.price,
    lead_time: input.lead_time,
    product_images: input.product_images,
    product_video: input.product_video,
    certifications: input.certifications,
    specifications: input.specifications,
    variants: input.variants,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    meta_keywords: input.meta_keywords,
    slug: input.slug,
  };
}

function toInsertPayload(
  input: ProductFormInput,
  status: ProductStatus,
  userId: string
) {
  return {
    user_id: userId,
    company_id: userId,
    ...formFields(input),
    status,
  };
}

function toUpdatePayload(input: ProductFormInput, status: ProductStatus) {
  return {
    ...formFields(input),
    status,
    updated_at: new Date().toISOString(),
  };
}

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

function buildProductSnapshot({
  id,
  userId,
  input,
  status,
}: {
  id: string;
  userId: string;
  input: ProductFormInput;
  status: ProductStatus;
}): Product {
  const now = new Date().toISOString();

  return {
    id,
    user_id: userId,
    company_id: userId,
    ...formFields(input),
    status,
    created_at: now,
    updated_at: now,
  };
}

function isDraftToPublishedTransition(
  previousStatus: unknown,
  nextStatus: ProductStatus
) {
  return (
    normalizeProductStatus(previousStatus) === "draft" &&
    nextStatus === "published"
  );
}

function triggerProductPublishedEmail(
  product: Product,
  previousStatus: unknown,
  nextStatus: ProductStatus
) {
  if (!isDraftToPublishedTransition(previousStatus, nextStatus)) {
    return;
  }

  console.info("[Tradexo Debug] Product Published Trigger", {
    productId: product.id,
    productName: product.product_name,
    status: product.status,
  });
  void queueProductPublishedEmail({ product });
}

export async function getCurrentUserId() {
  return getAuthenticatedUserId();
}

export async function fetchProducts() {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return { data: null, error };

  return { data: (data ?? []).map(mapProduct), error: null };
}

export async function fetchProduct(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error };

  return { data: mapProduct(data), error: null };
}

export async function createProduct(
  input: ProductFormInput,
  status: ProductStatus
) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data: inserted, error: insertError } = await supabase
    .from("products")
    .insert(toInsertPayload(input, status, userId))
    .select("id")
    .single();

  if (insertError) return { data: null, error: insertError };

  const snapshot = buildProductSnapshot({
    id: inserted.id as string,
    userId,
    input,
    status,
  });
  triggerProductPublishedEmail(snapshot, "draft", status);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", inserted.id)
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error };

  return { data: mapProduct(data), error: null };
}

export async function updateProduct(
  id: string,
  input: ProductFormInput,
  status: ProductStatus
) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("status")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) return { data: null, error: existingError };
  if (!existing) return { data: null, error: { message: "Product not found" } };

  const previousStatus = existing.status;

  const { error: updateError } = await supabase
    .from("products")
    .update(toUpdatePayload(input, status))
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) return { data: null, error: updateError };

  triggerProductPublishedEmail(
    buildProductSnapshot({ id, userId, input, status }),
    previousStatus,
    status
  );

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error };

  return { data: mapProduct(data), error: null };
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("status, product_name, slug")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) return { data: null, error: existingError };
  if (!existing) return { data: null, error: { message: "Product not found" } };

  const previousStatus = existing.status;

  const { error: updateError } = await supabase
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) return { data: null, error: updateError };

  const snapshot: Product = {
    id,
    user_id: userId,
    company_id: userId,
    product_name: (existing.product_name as string) ?? "",
    product_category: "",
    short_description: "",
    full_description: "",
    hs_code: "",
    country_of_origin: "",
    brand_name: "",
    model_number: "",
    moq: "",
    production_capacity: "",
    unit: "",
    price_on_request: true,
    currency: "USD",
    price: null,
    lead_time: "",
    product_images: [],
    product_video: "",
    certifications: "",
    specifications: parseSpecifications(null),
    variants: [],
    seo_title: "",
    seo_description: "",
    meta_keywords: "",
    slug: (existing.slug as string) ?? "",
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  triggerProductPublishedEmail(snapshot, previousStatus, status);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error };

  return { data: mapProduct(data), error: null };
}

export async function deleteProduct(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { error: authError };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return { error };
}

export async function uploadProductImage(
  userId: string,
  folder: string,
  file: File,
  order: number
): Promise<{ data: ProductImage | null; error: { message: string } | null }> {
  if (!file.type.startsWith("image/")) {
    return { data: null, error: { message: "Only PNG, JPG, or WebP images are allowed." } };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { data: null, error: { message: `${file.name} exceeds the 5 MB limit.` } };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file);

  if (uploadError) {
    return { data: null, error: { message: uploadError.message } };
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return {
    data: {
      url: data.publicUrl,
      order,
      uploaded_at: new Date().toISOString(),
    },
    error: null,
  };
}
