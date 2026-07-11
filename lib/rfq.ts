import { supabase } from "@/lib/supabase";
import type {
  CreateRFQInput,
  RFQ,
  RFQBuyerFilters,
  RFQPublicFilters,
  RFQStatus,
  UpdateRFQInput,
} from "@/types/rfq";
import {
  DEFAULT_RFQ_BUDGET_TYPE,
  DEFAULT_RFQ_CURRENCY,
  normalizeRFQBudgetType,
  normalizeRFQStatus,
  normalizeRFQVisibility,
  validateCreateRFQInput,
  validateRFQCoreFields,
  validateRFQStatusTransition,
  validateUpdateRFQInput,
} from "@/types/rfq";

export type { CreateRFQInput, UpdateRFQInput, RFQBuyerFilters, RFQPublicFilters };

const DEFAULT_PAGE_SIZE = 10;

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

function optionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeAttachmentUrls(urls?: string[]) {
  return (urls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);
}

function mapRFQ(row: Record<string, unknown>): RFQ {
  return {
    id: row.id as string,
    buyer_user_id: (row.buyer_user_id as string) ?? "",
    product_id: (row.product_id as string | null) ?? null,
    title: (row.title as string) ?? "",
    description: (row.description as string) ?? "",
    quantity: row.quantity != null ? Number(row.quantity) : 0,
    unit: (row.unit as string) ?? "",
    target_price: row.target_price != null ? Number(row.target_price) : null,
    currency: (row.currency as string) ?? DEFAULT_RFQ_CURRENCY,
    delivery_country: (row.delivery_country as string) ?? "",
    delivery_city: (row.delivery_city as string | null) ?? null,
    industry: (row.industry as string | null) ?? null,
    industry_category: (row.industry_category as string | null) ?? null,
    budget_type: normalizeRFQBudgetType(row.budget_type),
    required_before: (row.required_before as string | null) ?? null,
    status: normalizeRFQStatus(row.status),
    visibility: normalizeRFQVisibility(row.visibility),
    attachment_urls: Array.isArray(row.attachment_urls)
      ? row.attachment_urls.filter((url): url is string => typeof url === "string")
      : [],
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function buildCreatePayload(input: CreateRFQInput, buyerUserId: string) {
  return {
    buyer_user_id: buyerUserId,
    product_id: input.product_id ?? null,
    title: input.title.trim(),
    description: input.description.trim(),
    quantity: input.quantity,
    unit: input.unit.trim(),
    target_price: input.target_price ?? null,
    currency: input.currency?.trim() || DEFAULT_RFQ_CURRENCY,
    delivery_country: input.delivery_country.trim(),
    delivery_city: optionalText(input.delivery_city),
    industry: optionalText(input.industry),
    industry_category: optionalText(input.industry_category),
    budget_type: input.budget_type ?? DEFAULT_RFQ_BUDGET_TYPE,
    required_before: optionalText(input.required_before),
    status: "draft" as const,
    visibility: input.visibility ?? "private",
    attachment_urls: normalizeAttachmentUrls(input.attachment_urls),
  };
}

function buildUpdatePayload(input: UpdateRFQInput) {
  const payload: Record<string, unknown> = {};

  if (input.product_id !== undefined) {
    payload.product_id = input.product_id;
  }

  if (input.title !== undefined) {
    payload.title = input.title.trim();
  }

  if (input.description !== undefined) {
    payload.description = input.description.trim();
  }

  if (input.quantity !== undefined) {
    payload.quantity = input.quantity;
  }

  if (input.unit !== undefined) {
    payload.unit = input.unit.trim();
  }

  if (input.target_price !== undefined) {
    payload.target_price = input.target_price;
  }

  if (input.currency !== undefined) {
    payload.currency = input.currency.trim() || DEFAULT_RFQ_CURRENCY;
  }

  if (input.delivery_country !== undefined) {
    payload.delivery_country = input.delivery_country.trim();
  }

  if (input.delivery_city !== undefined) {
    payload.delivery_city = optionalText(input.delivery_city);
  }

  if (input.industry !== undefined) {
    payload.industry = optionalText(input.industry);
  }

  if (input.industry_category !== undefined) {
    payload.industry_category = optionalText(input.industry_category);
  }

  if (input.budget_type !== undefined) {
    payload.budget_type = input.budget_type;
  }

  if (input.required_before !== undefined) {
    payload.required_before = optionalText(input.required_before);
  }

  if (input.visibility !== undefined) {
    payload.visibility = input.visibility;
  }

  if (input.attachment_urls !== undefined) {
    payload.attachment_urls = normalizeAttachmentUrls(input.attachment_urls);
  }

  if (input.status !== undefined) {
    payload.status = input.status;
  }

  return payload;
}

function isEditableRFQStatus(status: RFQStatus) {
  return status === "draft" || status === "open";
}

function isDeletableRFQStatus(status: RFQStatus) {
  return status === "draft" || status === "cancelled";
}

export async function createRFQ(input: CreateRFQInput) {
  const validationError = validateCreateRFQInput(input);

  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("rfqs")
    .insert(buildCreatePayload(input, userId))
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapRFQ(data), error: null };
}

export async function updateRFQ(id: string, input: UpdateRFQInput) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rfqs")
    .select("*")
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return { data: null, error: { message: "RFQ not found." } };
  }

  const current = mapRFQ(existing);

  if (!isEditableRFQStatus(current.status)) {
    return {
      data: null,
      error: { message: "Only draft or open RFQs can be updated." },
    };
  }

  const validationError = validateUpdateRFQInput(input, current);

  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const payload = buildUpdatePayload(input);

  if (Object.keys(payload).length === 0) {
    return { data: current, error: null };
  }

  const { data, error } = await supabase
    .from("rfqs")
    .update(payload)
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapRFQ(data), error: null };
}

export async function deleteRFQ(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rfqs")
    .select("status")
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { error: fetchError };
  }

  if (!existing) {
    return { error: { message: "RFQ not found." } };
  }

  const status = normalizeRFQStatus(existing.status);

  if (!isDeletableRFQStatus(status)) {
    return {
      error: { message: "Only draft or cancelled RFQs can be deleted." },
    };
  }

  const { error } = await supabase
    .from("rfqs")
    .delete()
    .eq("id", id)
    .eq("buyer_user_id", userId);

  return { error: error ?? null };
}

export async function fetchBuyerRFQs(filters: RFQBuyerFilters = {}) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, count: 0, error: authError };
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("rfqs")
    .select("*", { count: "exact" })
    .eq("buyer_user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return { data: null, count: 0, error };
  }

  return {
    data: (data ?? []).map((row) => mapRFQ(row as Record<string, unknown>)),
    count: count ?? 0,
    error: null,
  };
}

export async function fetchPublicRFQs(filters: RFQPublicFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("rfqs")
    .select("*", { count: "exact" })
    .eq("status", "open")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { data: null, count: 0, error };
  }

  return {
    data: (data ?? []).map((row) => mapRFQ(row as Record<string, unknown>)),
    count: count ?? 0,
    error: null,
  };
}

export async function fetchRFQById(id: string) {
  const { data, error } = await supabase
    .from("rfqs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapRFQ(data), error: null };
}

export async function publishRFQ(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rfqs")
    .select("*")
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return { data: null, error: { message: "RFQ not found." } };
  }

  const current = mapRFQ(existing);
  const transitionError = validateRFQStatusTransition(current.status, "open");

  if (transitionError) {
    return { data: null, error: { message: transitionError } };
  }

  const validationError = validateRFQCoreFields(current);

  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const { data, error } = await supabase
    .from("rfqs")
    .update({ status: "open" })
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapRFQ(data), error: null };
}

export async function closeRFQ(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("rfqs")
    .select("status")
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return { data: null, error: { message: "RFQ not found." } };
  }

  const currentStatus = normalizeRFQStatus(existing.status);
  const transitionError = validateRFQStatusTransition(currentStatus, "closed");

  if (transitionError) {
    return { data: null, error: { message: transitionError } };
  }

  const { data, error } = await supabase
    .from("rfqs")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("buyer_user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapRFQ(data), error: null };
}
