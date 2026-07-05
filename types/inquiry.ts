export type InquiryStatus = "new" | "read" | "replied" | "closed";

/** Reserved for future UI-only priority column (not stored in database). */
export type InquiryPriority = "normal" | "high" | "urgent";

export type Inquiry = {
  id: string;
  created_at: string;
  updated_at: string;
  supplier_user_id: string;
  buyer_name: string;
  buyer_company: string | null;
  buyer_email: string;
  buyer_country: string | null;
  buyer_phone: string | null;
  product_id: string | null;
  product_name: string;
  message: string;
  reply_message: string | null;
  replied_at: string | null;
  status: InquiryStatus;
};

/** List/card display shape with optional future-only fields. */
export type InquiryListItem = Inquiry & {
  priority?: InquiryPriority;
};

export type InquirySort = "newest" | "oldest";

export type InquiryFilters = {
  search?: string;
  status?: InquiryStatus | "all";
  sort?: InquirySort;
  page?: number;
  pageSize?: number;
};

export type InquiryCounts = {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
};

export type CreateInquiryInput = {
  supplier_user_id: string;
  buyer_name: string;
  buyer_company?: string;
  buyer_email: string;
  buyer_country?: string;
  buyer_phone?: string;
  product_id: string;
  product_name: string;
  message: string;
};

export const INQUIRY_STATUS_OPTIONS: {
  value: InquiryStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

export const DEFAULT_INQUIRY_FILTERS: Required<
  Pick<InquiryFilters, "status" | "sort" | "page" | "pageSize">
> = {
  status: "all",
  sort: "newest",
  page: 1,
  pageSize: 10,
};

export const EMPTY_INQUIRY_COUNTS: InquiryCounts = {
  total: 0,
  new: 0,
  read: 0,
  replied: 0,
  closed: 0,
};

export function normalizeInquiryStatus(status: unknown): InquiryStatus {
  if (
    status === "new" ||
    status === "read" ||
    status === "replied" ||
    status === "closed"
  ) {
    return status;
  }

  return "new";
}

export const MAX_INQUIRY_REPLY_LENGTH = 5000;

export function validateInquiryReply(message: string): string | null {
  const trimmed = message.trim();

  if (!trimmed) {
    return "Reply is required.";
  }

  if (trimmed.length > MAX_INQUIRY_REPLY_LENGTH) {
    return `Reply must be ${MAX_INQUIRY_REPLY_LENGTH} characters or fewer.`;
  }

  return null;
}

/** Derive avatar initials from buyer name for list/card UI. */
export function getBuyerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
