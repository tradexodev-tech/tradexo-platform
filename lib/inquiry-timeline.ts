import type { Inquiry, InquiryStatus } from "@/types/inquiry";

export type InquiryTimelineEventType =
  | "submitted"
  | "opened"
  | "replied"
  | "closed";

export type InquiryTimelineEvent = {
  id: string;
  type: InquiryTimelineEventType;
  title: string;
  timestamp: string | null;
};

const EVENT_ORDER: Record<InquiryTimelineEventType, number> = {
  submitted: 0,
  opened: 1,
  replied: 2,
  closed: 3,
};

const OPENED_STATUSES: InquiryStatus[] = ["read", "replied", "closed"];

function hasOpened(inquiry: Inquiry) {
  return OPENED_STATUSES.includes(inquiry.status);
}

/**
 * Best-effort opened timestamp using existing fields.
 * Accurate read time requires the optional `read_at` column (see migration SQL).
 */
function getOpenedTimestamp(inquiry: Inquiry): string | null {
  if (!hasOpened(inquiry)) {
    return null;
  }

  const readAt = inquiry.read_at;
  if (readAt) {
    return readAt;
  }

  if (inquiry.status === "read" && !inquiry.replied_at) {
    return inquiry.updated_at || null;
  }

  return null;
}

/**
 * Best-effort closed timestamp using existing fields.
 * Accurate close time requires the optional `closed_at` column (see migration SQL).
 */
function getClosedTimestamp(inquiry: Inquiry): string | null {
  if (inquiry.status !== "closed") {
    return null;
  }

  if (inquiry.closed_at) {
    return inquiry.closed_at;
  }

  return inquiry.updated_at || null;
}

function compareEvents(a: InquiryTimelineEvent, b: InquiryTimelineEvent) {
  const timeA = a.timestamp ? new Date(a.timestamp).getTime() : Number.NaN;
  const timeB = b.timestamp ? new Date(b.timestamp).getTime() : Number.NaN;

  if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
    return timeA - timeB;
  }

  if (!Number.isNaN(timeA) && Number.isNaN(timeB)) {
    return -1;
  }

  if (Number.isNaN(timeA) && !Number.isNaN(timeB)) {
    return 1;
  }

  return EVENT_ORDER[a.type] - EVENT_ORDER[b.type];
}

export function buildInquiryTimeline(inquiry: Inquiry): InquiryTimelineEvent[] {
  const events: InquiryTimelineEvent[] = [];

  if (inquiry.created_at) {
    events.push({
      id: "submitted",
      type: "submitted",
      title: "Inquiry Submitted",
      timestamp: inquiry.created_at,
    });
  }

  if (hasOpened(inquiry)) {
    events.push({
      id: "opened",
      type: "opened",
      title: "Opened by Supplier",
      timestamp: getOpenedTimestamp(inquiry),
    });
  }

  if (inquiry.reply_message && inquiry.replied_at) {
    events.push({
      id: "replied",
      type: "replied",
      title: "Reply Sent",
      timestamp: inquiry.replied_at,
    });
  }

  if (inquiry.status === "closed") {
    events.push({
      id: "closed",
      type: "closed",
      title: "Closed",
      timestamp: getClosedTimestamp(inquiry),
    });
  }

  return events.sort(compareEvents);
}
