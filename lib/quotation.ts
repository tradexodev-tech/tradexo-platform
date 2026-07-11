import { supabase } from "@/lib/supabase";
import type {
  Quotation,
  QuotationWithRFQ,
  SubmitQuotationInput,
  UpdateQuotationInput,
} from "@/types/quotation";
import {
  DEFAULT_QUOTATION_CURRENCY,
  normalizeQuotationStatus,
  validateSubmitQuotationInput,
  validateUpdateQuotationInput,
} from "@/types/quotation";

export type { SubmitQuotationInput, UpdateQuotationInput };

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

function normalizeAttachmentUrls(urls?: string[]) {
  return (urls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);
}

function mapQuotation(row: Record<string, unknown>): Quotation {
  return {
    id: row.id as string,
    rfq_id: (row.rfq_id as string) ?? "",
    supplier_user_id: (row.supplier_user_id as string) ?? "",
    price: row.price != null ? Number(row.price) : 0,
    currency: (row.currency as string) ?? DEFAULT_QUOTATION_CURRENCY,
    lead_time: (row.lead_time as string) ?? "",
    message: (row.message as string) ?? "",
    attachment_urls: Array.isArray(row.attachment_urls)
      ? row.attachment_urls.filter((url): url is string => typeof url === "string")
      : [],
    status: normalizeQuotationStatus(row.status),
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

function mapQuotationWithRFQ(row: Record<string, unknown>): QuotationWithRFQ {
  const rfq = row.rfqs as Record<string, unknown> | null | undefined;

  return {
    ...mapQuotation(row),
    rfq_title: (rfq?.title as string) ?? "RFQ",
    rfq_status: (rfq?.status as string) ?? "",
  };
}

function isEditableQuotationStatus(status: Quotation["status"]) {
  return status === "submitted";
}

function isWithdrawableQuotationStatus(status: Quotation["status"]) {
  return status === "submitted";
}

async function verifyQuotableRFQ(rfqId: string) {
  const { data, error } = await supabase
    .from("rfqs")
    .select("id, status, visibility")
    .eq("id", rfqId)
    .maybeSingle();

  if (error) {
    return { error };
  }

  if (!data) {
    return { error: { message: "RFQ not found." } };
  }

  if (data.status !== "open") {
    return { error: { message: "Quotations can only be submitted for open RFQs." } };
  }

  return { error: null };
}

export async function submitQuotation(input: SubmitQuotationInput) {
  const validationError = validateSubmitQuotationInput(input);

  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const rfqError = await verifyQuotableRFQ(input.rfq_id);

  if (rfqError.error) {
    return { data: null, error: rfqError.error };
  }

  const { data: existing, error: existingError } = await supabase
    .from("quotations")
    .select("id, status")
    .eq("rfq_id", input.rfq_id)
    .eq("supplier_user_id", userId)
    .maybeSingle();

  if (existingError) {
    return { data: null, error: existingError };
  }

  if (existing && existing.status !== "withdrawn") {
    return {
      data: null,
      error: { message: "You have already submitted a quotation for this RFQ." },
    };
  }

  const payload = {
    rfq_id: input.rfq_id,
    supplier_user_id: userId,
    price: input.price,
    currency: input.currency?.trim() || DEFAULT_QUOTATION_CURRENCY,
    lead_time: input.lead_time.trim(),
    message: input.message.trim(),
    attachment_urls: normalizeAttachmentUrls(input.attachment_urls),
    status: "submitted" as const,
  };

  if (existing?.status === "withdrawn") {
    const { data, error } = await supabase
      .from("quotations")
      .update(payload)
      .eq("id", existing.id)
      .eq("supplier_user_id", userId)
      .select("*")
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: mapQuotation(data), error: null };
  }

  const { data, error } = await supabase
    .from("quotations")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        data: null,
        error: { message: "You have already submitted a quotation for this RFQ." },
      };
    }

    return { data: null, error };
  }

  return { data: mapQuotation(data), error: null };
}

export async function updateQuotation(id: string, input: UpdateQuotationInput) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return { data: null, error: { message: "Quotation not found." } };
  }

  const current = mapQuotation(existing);

  if (!isEditableQuotationStatus(current.status)) {
    return {
      data: null,
      error: { message: "Only submitted quotations can be updated." },
    };
  }

  const validationError = validateUpdateQuotationInput(input, current);

  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const payload: Record<string, unknown> = {};

  if (input.price !== undefined) {
    payload.price = input.price;
  }

  if (input.currency !== undefined) {
    payload.currency = input.currency.trim() || DEFAULT_QUOTATION_CURRENCY;
  }

  if (input.lead_time !== undefined) {
    payload.lead_time = input.lead_time.trim();
  }

  if (input.message !== undefined) {
    payload.message = input.message.trim();
  }

  if (input.attachment_urls !== undefined) {
    payload.attachment_urls = normalizeAttachmentUrls(input.attachment_urls);
  }

  const { data, error } = await supabase
    .from("quotations")
    .update(payload)
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapQuotation(data), error: null };
}

export async function withdrawQuotation(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("quotations")
    .select("status")
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (!existing) {
    return { data: null, error: { message: "Quotation not found." } };
  }

  const status = normalizeQuotationStatus(existing.status);

  if (!isWithdrawableQuotationStatus(status)) {
    return {
      data: null,
      error: { message: "Only submitted quotations can be withdrawn." },
    };
  }

  const { data, error } = await supabase
    .from("quotations")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: mapQuotation(data), error: null };
}

export async function fetchSupplierQuotations() {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("quotations")
    .select("*, rfqs(title, status)")
    .eq("supplier_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) =>
      mapQuotationWithRFQ(row as Record<string, unknown>)
    ),
    error: null,
  };
}

export async function fetchRFQQuotations(rfqId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("rfq_id", rfqId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  return {
    data: (data ?? []).map((row) => mapQuotation(row as Record<string, unknown>)),
    error: null,
  };
}

export async function fetchQuotation(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapQuotation(data), error: null };
}

export async function fetchSupplierQuotationForRFQ(rfqId: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();

  if (!userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("rfq_id", rfqId)
    .eq("supplier_user_id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapQuotation(data), error: null };
}
