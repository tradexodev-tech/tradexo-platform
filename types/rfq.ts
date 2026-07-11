export type RFQStatus = "draft" | "open" | "closed" | "cancelled";

export type RFQVisibility = "public" | "private";

export type RFQBudgetType = "fixed" | "negotiable";

export type RFQ = {
  id: string;
  buyer_user_id: string;
  product_id: string | null;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  target_price: number | null;
  currency: string;
  delivery_country: string;
  delivery_city: string | null;
  industry: string | null;
  industry_category: string | null;
  budget_type: RFQBudgetType;
  required_before: string | null;
  status: RFQStatus;
  visibility: RFQVisibility;
  attachment_urls: string[];
  created_at: string;
  updated_at: string;
};

export type CreateRFQInput = {
  product_id?: string | null;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  target_price?: number | null;
  currency?: string;
  delivery_country: string;
  delivery_city?: string;
  industry?: string;
  industry_category?: string;
  budget_type?: RFQBudgetType;
  required_before?: string | null;
  visibility?: RFQVisibility;
  attachment_urls?: string[];
};

export type UpdateRFQInput = {
  product_id?: string | null;
  title?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  target_price?: number | null;
  currency?: string;
  delivery_country?: string;
  delivery_city?: string | null;
  industry?: string | null;
  industry_category?: string | null;
  budget_type?: RFQBudgetType;
  required_before?: string | null;
  visibility?: RFQVisibility;
  attachment_urls?: string[];
  status?: RFQStatus;
};

export type RFQBuyerFilters = {
  status?: RFQStatus | "all";
  page?: number;
  pageSize?: number;
};

export type RFQPublicFilters = {
  page?: number;
  pageSize?: number;
};

export const RFQ_STATUS_OPTIONS: { value: RFQStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

export const RFQ_VISIBILITY_OPTIONS: { value: RFQVisibility; label: string }[] =
  [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

export const DEFAULT_RFQ_CURRENCY = "USD";

export const DEFAULT_RFQ_BUDGET_TYPE: RFQBudgetType = "negotiable";

export const RFQ_BUDGET_TYPE_OPTIONS: { value: RFQBudgetType; label: string }[] =
  [
    { value: "fixed", label: "Fixed" },
    { value: "negotiable", label: "Negotiable" },
  ];

export const VALID_RFQ_STATUS_TRANSITIONS: Record<RFQStatus, RFQStatus[]> = {
  draft: ["open", "cancelled"],
  open: ["closed", "cancelled"],
  closed: [],
  cancelled: [],
};

export function normalizeRFQStatus(status: unknown): RFQStatus {
  if (
    status === "draft" ||
    status === "open" ||
    status === "closed" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "draft";
}

export function normalizeRFQVisibility(visibility: unknown): RFQVisibility {
  if (visibility === "public" || visibility === "private") {
    return visibility;
  }

  return "private";
}

export function normalizeRFQBudgetType(budgetType: unknown): RFQBudgetType {
  if (budgetType === "fixed" || budgetType === "negotiable") {
    return budgetType;
  }

  return DEFAULT_RFQ_BUDGET_TYPE;
}

export function validateRFQBudgetType(
  budgetType?: RFQBudgetType
): string | null {
  if (budgetType === undefined) {
    return null;
  }

  if (budgetType !== "fixed" && budgetType !== "negotiable") {
    return 'Budget type must be either "fixed" or "negotiable".';
  }

  return null;
}

export function canTransitionRFQStatus(
  currentStatus: RFQStatus,
  nextStatus: RFQStatus
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  return VALID_RFQ_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function validateRFQCoreFields(input: {
  title?: string;
  description?: string;
  quantity?: number;
  delivery_country?: string;
}): string | null {
  const title = input.title?.trim() ?? "";

  if (!title) {
    return "Title is required.";
  }

  const description = input.description?.trim() ?? "";

  if (!description) {
    return "Description is required.";
  }

  if (input.quantity == null || Number(input.quantity) <= 0) {
    return "Quantity must be greater than 0.";
  }

  const deliveryCountry = input.delivery_country?.trim() ?? "";

  if (!deliveryCountry) {
    return "Delivery country is required.";
  }

  return null;
}

export function validateCreateRFQInput(input: CreateRFQInput): string | null {
  const coreError = validateRFQCoreFields(input);

  if (coreError) {
    return coreError;
  }

  const unit = input.unit?.trim() ?? "";

  if (!unit) {
    return "Unit is required.";
  }

  return validateRFQBudgetType(input.budget_type);
}

export function validateUpdateRFQInput(
  input: UpdateRFQInput,
  current: Pick<
    RFQ,
    "title" | "description" | "quantity" | "delivery_country" | "status"
  >
): string | null {
  if (
    input.title !== undefined ||
    input.description !== undefined ||
    input.quantity !== undefined ||
    input.delivery_country !== undefined
  ) {
    const coreError = validateRFQCoreFields({
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      quantity: input.quantity ?? current.quantity,
      delivery_country: input.delivery_country ?? current.delivery_country,
    });

    if (coreError) {
      return coreError;
    }
  }

  if (input.unit !== undefined && !input.unit.trim()) {
    return "Unit is required.";
  }

  if (
    input.status !== undefined &&
    !canTransitionRFQStatus(current.status as RFQStatus, input.status)
  ) {
    return `Cannot transition RFQ status from ${current.status} to ${input.status}.`;
  }

  return validateRFQBudgetType(input.budget_type);
}

export function validateRFQStatusTransition(
  currentStatus: RFQStatus,
  nextStatus: RFQStatus
): string | null {
  if (!canTransitionRFQStatus(currentStatus, nextStatus)) {
    return `Cannot transition RFQ status from ${currentStatus} to ${nextStatus}.`;
  }

  return null;
}
