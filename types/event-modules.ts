/**
 * Future module architecture stubs for Tradexo Event OS.
 * DO NOT implement — only type contracts for upcoming modules.
 */

export type EventModuleId =
  | "booths"
  | "meetings"
  | "crm"
  | "qr_leads"
  | "lead_capture"
  | "ai_matchmaking"
  | "notifications";

export type EventModuleStatus = "planned" | "in_development" | "beta" | "live";

export type EventModuleDefinition = {
  id: EventModuleId;
  label: string;
  description: string;
  status: EventModuleStatus;
  dependsOn: EventModuleId[];
  routeSegment: string;
};

export const EVENT_FUTURE_MODULES: EventModuleDefinition[] = [
  {
    id: "booths",
    label: "Booths",
    description: "Hall layouts, booth allocation, exhibitor assignments, and floor plans.",
    status: "planned",
    dependsOn: [],
    routeSegment: "booths",
  },
  {
    id: "meetings",
    label: "Meetings",
    description: "Buyer-supplier meeting scheduler with calendar sync and room booking.",
    status: "planned",
    dependsOn: ["booths"],
    routeSegment: "meetings",
  },
  {
    id: "crm",
    label: "CRM",
    description: "Contact management, lead pipeline, and exhibitor relationship tracking.",
    status: "planned",
    dependsOn: [],
    routeSegment: "crm",
  },
  {
    id: "qr_leads",
    label: "QR Leads",
    description: "QR code generation and scan-based lead capture at booths and sessions.",
    status: "planned",
    dependsOn: ["booths", "crm"],
    routeSegment: "qr-leads",
  },
  {
    id: "lead_capture",
    label: "Lead Capture",
    description: "Badge scanning, business card capture, and real-time lead scoring.",
    status: "planned",
    dependsOn: ["crm", "qr_leads"],
    routeSegment: "lead-capture",
  },
  {
    id: "ai_matchmaking",
    label: "AI Matchmaking",
    description: "AI-powered buyer-supplier matching based on profiles and event goals.",
    status: "planned",
    dependsOn: ["meetings", "crm"],
    routeSegment: "ai",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Event announcements, email campaigns, and push notifications.",
    status: "planned",
    dependsOn: [],
    routeSegment: "emails",
  },
];

export type EventBoothModule = {
  event_id: string;
  hall_id: string;
  booth_number: string;
  exhibitor_id?: string;
  status: "available" | "reserved" | "occupied";
};

export type EventMeetingModule = {
  event_id: string;
  buyer_id: string;
  supplier_id: string;
  scheduled_at: string;
  location?: string;
  status: "pending" | "confirmed" | "cancelled";
};

export type EventCRMContact = {
  event_id: string;
  contact_id: string;
  source: "registration" | "qr_scan" | "meeting" | "manual";
  score?: number;
};

export type EventQRLead = {
  event_id: string;
  scanned_by: string;
  scanned_contact: string;
  booth_id?: string;
  captured_at: string;
};

export type EventAIMatch = {
  event_id: string;
  user_a_id: string;
  user_b_id: string;
  score: number;
  reasons: string[];
};
