export type QuotationStatus =
  | "submitted"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type Quotation = {
  id: string;
  rfq_id: string;
  supplier_user_id: string;
  price: number;
  currency: string;
  lead_time: string;
  message: string;
  attachment_urls: string[];
  status: QuotationStatus;
  created_at: string;
  updated_at: string;
};

export type QuotationWithRFQ = Quotation & {
  rfq_title: string;
  rfq_status: string;
};

export type SubmitQuotationInput = {
  rfq_id: string;
  price: number;
  currency?: string;
  lead_time: string;
  message: string;
  attachment_urls?: string[];
};

export type UpdateQuotationInput = {
  price?: number;
  currency?: string;
  lead_time?: string;
  message?: string;
  attachment_urls?: string[];
};

export const QUOTATION_STATUS_OPTIONS: {
  value: QuotationStatus;
  label: string;
}[] = [
  { value: "submitted", label: "Submitted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export const DEFAULT_QUOTATION_CURRENCY = "USD";

export function normalizeQuotationStatus(status: unknown): QuotationStatus {
  if (
    status === "submitted" ||
    status === "accepted" ||
    status === "rejected" ||
    status === "withdrawn"
  ) {
    return status;
  }

  return "submitted";
}

export function validateSubmitQuotationInput(
  input: SubmitQuotationInput
): string | null {
  if (input.price == null || Number(input.price) <= 0) {
    return "Price must be greater than 0.";
  }

  const leadTime = input.lead_time?.trim() ?? "";

  if (!leadTime) {
    return "Lead time is required.";
  }

  const message = input.message?.trim() ?? "";

  if (!message) {
    return "Message is required.";
  }

  return null;
}

export function validateUpdateQuotationInput(
  input: UpdateQuotationInput,
  current: Pick<Quotation, "price" | "lead_time" | "message">
): string | null {
  if (input.price !== undefined && Number(input.price) <= 0) {
    return "Price must be greater than 0.";
  }

  if (input.lead_time !== undefined && !input.lead_time.trim()) {
    return "Lead time is required.";
  }

  if (input.message !== undefined && !input.message.trim()) {
    return "Message is required.";
  }

  if (
    input.price === undefined &&
    input.lead_time === undefined &&
    input.message === undefined &&
    input.currency === undefined &&
    input.attachment_urls === undefined
  ) {
    return null;
  }

  const price = input.price ?? current.price;
  const leadTime = (input.lead_time ?? current.lead_time).trim();
  const message = (input.message ?? current.message).trim();

  if (price <= 0) {
    return "Price must be greater than 0.";
  }

  if (!leadTime) {
    return "Lead time is required.";
  }

  if (!message) {
    return "Message is required.";
  }

  return null;
}
