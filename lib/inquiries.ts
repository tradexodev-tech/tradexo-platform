import { supabase } from "@/lib/supabase";
import {
  queueInquiryReplySentEmail,
  queueNewInquiryReceivedEmail,
} from "@/lib/email";
import type {
  CreateInquiryInput,
  Inquiry,
  InquiryCounts,
  InquiryFilters,
  InquiryStatus,
} from "@/types/inquiry";
import { normalizeInquiryStatus, validateInquiryReply } from "@/types/inquiry";

export type { CreateInquiryInput };

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

function mapInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: row.id as string,
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
    supplier_user_id: (row.supplier_user_id as string) ?? "",
    buyer_name: (row.buyer_name as string) ?? "",
    buyer_company: (row.buyer_company as string | null) ?? null,
    buyer_email: (row.buyer_email as string) ?? "",
    buyer_country: (row.buyer_country as string | null) ?? null,
    buyer_phone: (row.buyer_phone as string | null) ?? null,
    product_id: (row.product_id as string | null) ?? null,
    product_name: (row.product_name as string) ?? "",
    message: (row.message as string) ?? "",
    reply_message: (row.reply_message as string | null) ?? null,
    replied_at: (row.replied_at as string | null) ?? null,
    read_at: (row.read_at as string | null | undefined) ?? null,
    closed_at: (row.closed_at as string | null | undefined) ?? null,
    status: normalizeInquiryStatus(row.status),
  };
}

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Escape user input for PostgREST `.or()` ilike filters. */
function buildPostgrestIlikePattern(search: string) {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '""')
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  return `"%${escaped}%"`;
}

export async function createInquiry(input: CreateInquiryInput) {
  const payload = {
    supplier_user_id: input.supplier_user_id,
    buyer_name: input.buyer_name.trim(),
    buyer_company: optionalText(input.buyer_company),
    buyer_email: input.buyer_email.trim(),
    buyer_country: optionalText(input.buyer_country),
    buyer_phone: optionalText(input.buyer_phone),
    product_id: input.product_id,
    product_name: input.product_name.trim(),
    message: input.message.trim(),
    status: "new" as const,
  };

  const { error } = await supabase.from("inquiries").insert(payload);

  if (error) return { data: null, error };

  void queueNewInquiryReceivedEmail({ input });

  return { data: null, error: null };
}

export async function fetchSupplierInquiries(filters: InquiryFilters = {}) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, count: 0, error: authError };

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("inquiries")
    .select("*", { count: "exact" })
    .eq("supplier_user_id", userId);

  const trimmedSearch = filters.search?.trim();
  if (trimmedSearch) {
    const pattern = buildPostgrestIlikePattern(trimmedSearch);
    query = query.or(
      `buyer_name.ilike.${pattern},buyer_email.ilike.${pattern},buyer_company.ilike.${pattern},product_name.ilike.${pattern}`
    );
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) return { data: null, count: 0, error };

  return {
    data: (data ?? []).map(mapInquiry),
    count: count ?? 0,
    error: null,
  };
}

export async function fetchSupplierInquiry(id: string) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return { data: mapInquiry(data), error: null };
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { error: authError };

  const payload: {
    status: InquiryStatus;
    read_at?: string;
    closed_at?: string;
  } = { status };

  if (status === "read") {
    const { data: existing, error: fetchError } = await supabase
      .from("inquiries")
      .select("read_at")
      .eq("id", id)
      .eq("supplier_user_id", userId)
      .maybeSingle();

    if (fetchError) return { error: fetchError };
    if (!existing) return { error: { message: "Inquiry not found" } };

    if (!existing.read_at) {
      payload.read_at = new Date().toISOString();
    }
  }

  if (status === "closed") {
    payload.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("inquiries")
    .update(payload)
    .eq("id", id)
    .eq("supplier_user_id", userId);

  if (error) return { error };

  return { error: null };
}

export async function replyToInquiry(id: string, replyMessage: string) {
  const validationError = validateInquiryReply(replyMessage);
  if (validationError) {
    return { data: null, error: { message: validationError } };
  }

  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { data: null, error: authError };

  const trimmed = replyMessage.trim();
  const repliedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("inquiries")
    .update({
      reply_message: trimmed,
      replied_at: repliedAt,
      status: "replied" as const,
    })
    .eq("id", id)
    .eq("supplier_user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) {
    return { data: null, error: { message: "Inquiry not found" } };
  }

  const inquiry = mapInquiry(data);
  void queueInquiryReplySentEmail({ inquiry });

  return { data: inquiry, error: null };
}

async function countInquiriesForSupplier(status?: InquiryStatus) {
  const { userId, error: authError } = await getAuthenticatedUserId();
  if (!userId) return { count: 0, error: authError };

  let query = supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("supplier_user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) return { count: 0, error };

  return { count: count ?? 0, error: null };
}

export async function getInquiryCounts() {
  const [totalResult, newResult, readResult, repliedResult, closedResult] =
    await Promise.all([
      countInquiriesForSupplier(),
      countInquiriesForSupplier("new"),
      countInquiriesForSupplier("read"),
      countInquiriesForSupplier("replied"),
      countInquiriesForSupplier("closed"),
    ]);

  const error =
    totalResult.error ??
    newResult.error ??
    readResult.error ??
    repliedResult.error ??
    closedResult.error ??
    null;

  if (error) {
    return { data: null, error };
  }

  const counts: InquiryCounts = {
    total: totalResult.count,
    new: newResult.count,
    read: readResult.count,
    replied: repliedResult.count,
    closed: closedResult.count,
  };

  return { data: counts, error: null };
}
