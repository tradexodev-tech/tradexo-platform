import { getCurrentUserId } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import type { InquiryStatus } from "@/types/inquiry";
import type { ProductStatus } from "@/types/product";

export type DashboardActivityType =
  | "inquiry_received"
  | "inquiry_opened"
  | "inquiry_reply_sent"
  | "inquiry_closed"
  | "product_published"
  | "product_updated";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  occurredAt: string;
};

type InquiryActivitySource = {
  id: string;
  buyer_name: string;
  product_name: string;
  status: InquiryStatus;
  created_at: string;
  read_at: string | null;
  replied_at: string | null;
  closed_at: string | null;
  updated_at: string;
};

type ProductActivitySource = {
  id: string;
  product_name: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

const SOURCE_RECORD_LIMIT = 50;
const ACTIVITY_LIMIT = 10;
const PRODUCT_UPDATE_THRESHOLD_MS = 60_000;

function buildInquiryActivities(
  inquiry: InquiryActivitySource
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];
  const buyer = inquiry.buyer_name.trim() || "A buyer";
  const product = inquiry.product_name.trim() || "a product";

  if (inquiry.created_at) {
    activities.push({
      id: `inquiry-received-${inquiry.id}-${inquiry.created_at}`,
      type: "inquiry_received",
      title: "New inquiry received",
      description: `${buyer} inquired about ${product}`,
      occurredAt: inquiry.created_at,
    });
  }

  if (inquiry.read_at) {
    activities.push({
      id: `inquiry-opened-${inquiry.id}-${inquiry.read_at}`,
      type: "inquiry_opened",
      title: "Inquiry opened (Read)",
      description: `You opened an inquiry from ${buyer}`,
      occurredAt: inquiry.read_at,
    });
  }

  if (inquiry.replied_at) {
    activities.push({
      id: `inquiry-replied-${inquiry.id}-${inquiry.replied_at}`,
      type: "inquiry_reply_sent",
      title: "Reply sent",
      description: `You replied to ${buyer} about ${product}`,
      occurredAt: inquiry.replied_at,
    });
  }

  const closedAt =
    inquiry.closed_at ??
    (inquiry.status === "closed" ? inquiry.updated_at : null);

  if (closedAt) {
    activities.push({
      id: `inquiry-closed-${inquiry.id}-${closedAt}`,
      type: "inquiry_closed",
      title: "Inquiry closed",
      description: `Inquiry from ${buyer} about ${product} was closed`,
      occurredAt: closedAt,
    });
  }

  return activities;
}

function buildProductActivities(
  product: ProductActivitySource
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];
  const name = product.product_name.trim() || "Untitled product";
  const createdAtMs = product.created_at
    ? new Date(product.created_at).getTime()
    : 0;
  const updatedAtMs = product.updated_at
    ? new Date(product.updated_at).getTime()
    : 0;
  const wasUpdatedAfterCreate =
    updatedAtMs - createdAtMs > PRODUCT_UPDATE_THRESHOLD_MS;

  if (product.status === "published" && product.created_at) {
    activities.push({
      id: `product-published-${product.id}-${product.created_at}`,
      type: "product_published",
      title: "Product published",
      description: `${name} is live in your catalog`,
      occurredAt: product.created_at,
    });
  }

  if (wasUpdatedAfterCreate && product.updated_at) {
    activities.push({
      id: `product-updated-${product.id}-${product.updated_at}`,
      type: "product_updated",
      title: "Product updated",
      description: `Changes saved to ${name}`,
      occurredAt: product.updated_at,
    });
  }

  return activities;
}

export function mergeDashboardActivities(
  activities: DashboardActivity[],
  limit = ACTIVITY_LIMIT
): DashboardActivity[] {
  return [...activities]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    )
    .slice(0, limit);
}

export function formatActivityRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60_000) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export async function fetchRecentDashboardActivity(limit = ACTIVITY_LIMIT) {
  const { userId, error: authError } = await getCurrentUserId();
  if (!userId) {
    return {
      data: null,
      error: authError ?? { message: "User not authenticated" },
    };
  }

  const [inquiriesResult, productsResult] = await Promise.all([
    supabase
      .from("inquiries")
      .select(
        "id, buyer_name, product_name, status, created_at, read_at, replied_at, closed_at, updated_at"
      )
      .eq("supplier_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(SOURCE_RECORD_LIMIT),
    supabase
      .from("products")
      .select("id, product_name, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(SOURCE_RECORD_LIMIT),
  ]);

  const error = inquiriesResult.error ?? productsResult.error ?? null;
  if (error) {
    return { data: null, error };
  }

  const inquiryActivities = (inquiriesResult.data ?? []).flatMap((row) =>
    buildInquiryActivities({
      id: row.id as string,
      buyer_name: (row.buyer_name as string) ?? "",
      product_name: (row.product_name as string) ?? "",
      status: row.status as InquiryStatus,
      created_at: (row.created_at as string) ?? "",
      read_at: (row.read_at as string | null) ?? null,
      replied_at: (row.replied_at as string | null) ?? null,
      closed_at: (row.closed_at as string | null) ?? null,
      updated_at: (row.updated_at as string) ?? "",
    })
  );

  const productActivities = (productsResult.data ?? []).flatMap((row) =>
    buildProductActivities({
      id: row.id as string,
      product_name: (row.product_name as string) ?? "",
      status: row.status as ProductStatus,
      created_at: (row.created_at as string) ?? "",
      updated_at: (row.updated_at as string) ?? "",
    })
  );

  return {
    data: mergeDashboardActivities(
      [...inquiryActivities, ...productActivities],
      limit
    ),
    error: null,
  };
}
