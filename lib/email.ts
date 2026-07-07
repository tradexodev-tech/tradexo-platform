import { supabase } from "@/lib/supabase";
import {
  buildInquiryReplyEmail,
  buildNewInquiryEmail,
  buildProductPublishedEmail,
  buildWelcomeEmail,
} from "@/lib/email-templates";
import type { CreateInquiryInput, Inquiry } from "@/types/inquiry";
import type { Product } from "@/types/product";

export type EmailConfig = {
  fromName: string;
  fromAddress: string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
  fromName?: string;
  fromAddress?: string;
};

export type EmailSendResult = {
  ok: boolean;
  provider: string;
  error?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(payload: EmailPayload): Promise<EmailSendResult>;
}

class MockEmailProvider implements EmailProvider {
  readonly name = "mock";

  async send(payload: EmailPayload): Promise<EmailSendResult> {
    console.info("[Tradexo Email]", {
      provider: this.name,
      from: `${payload.fromName} <${payload.fromAddress}>`,
      to: payload.to,
      subject: payload.subject,
      tags: payload.tags ?? [],
      htmlLength: payload.html.length,
      preview: payload.text ?? payload.subject,
    });

    return { ok: true, provider: this.name };
  }
}

let activeProvider: EmailProvider = new MockEmailProvider();

export function setEmailProvider(provider: EmailProvider) {
  activeProvider = provider;
}

export function getEmailProvider() {
  return activeProvider;
}

function logEmailFailure(event: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown email error";

  console.error(`[Tradexo Email] ${event} failed:`, message);
}

const DEFAULT_EMAIL_FROM_NAME = "Tradexo";
const DEFAULT_EMAIL_FROM_ADDRESS = "noreply@tradexo.io";

export function getEmailConfig(): EmailConfig {
  return {
    fromName: process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_EMAIL_FROM_NAME,
    fromAddress:
      process.env.EMAIL_FROM_ADDRESS?.trim() || DEFAULT_EMAIL_FROM_ADDRESS,
  };
}

function resolveEmailPayload(payload: EmailPayload): EmailPayload {
  const config = getEmailConfig();

  return {
    ...payload,
    fromName: payload.fromName ?? config.fromName,
    fromAddress: payload.fromAddress ?? config.fromAddress,
  };
}

export function getAppBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "https://tradexo.io";
}

export async function sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const resolvedPayload = resolveEmailPayload(payload);

  try {
    return await activeProvider.send(resolvedPayload);
  } catch (error) {
    logEmailFailure("sendEmail", error);
    return {
      ok: false,
      provider: activeProvider.name,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export function sendEmailAsync(payload: EmailPayload) {
  void sendEmail(payload).then((result) => {
    if (!result.ok) {
      logEmailFailure("sendEmailAsync", result.error ?? "Unknown email error");
    }
  });
}

async function fetchProfileDisplayName(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, company_name")
    .eq("id", userId)
    .maybeSingle();

  return (
    (data?.full_name as string | undefined)?.trim() ||
    (data?.company_name as string | undefined)?.trim() ||
    "Tradexo User"
  );
}

export async function resolveRecipientEmail(userId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id !== userId || !user.email) {
    return null;
  }

  const displayName = await fetchProfileDisplayName(userId);

  return {
    email: user.email,
    displayName,
  };
}

function buildDevFallbackEmail(userId: string) {
  return `dev+${userId}@tradexo.local`;
}

export function queueWelcomeEmail({
  email,
  recipientName,
}: {
  email: string;
  recipientName?: string;
}) {
  const emailConfig = getEmailConfig();
  const { subject, html } = buildWelcomeEmail({
    recipientName: recipientName?.trim() || email.split("@")[0] || "there",
    dashboardUrl: `${getAppBaseUrl()}/dashboard`,
    senderConfig: emailConfig,
  });

  sendEmailAsync({
    to: email,
    subject,
    html,
    tags: ["welcome"],
  });
}

export async function queueNewInquiryReceivedEmail({
  input,
}: {
  input: CreateInquiryInput;
}) {
  const recipient = await resolveRecipientEmail(input.supplier_user_id);
  const supplierName = recipient?.displayName
    ?? (await fetchProfileDisplayName(input.supplier_user_id));
  const to = recipient?.email ?? buildDevFallbackEmail(input.supplier_user_id);

  const emailConfig = getEmailConfig();
  const { subject, html } = buildNewInquiryEmail({
    supplierName,
    buyerName: input.buyer_name.trim(),
    buyerCompany: input.buyer_company?.trim() || null,
    productName: input.product_name.trim(),
    inquiryMessage: input.message.trim(),
    dashboardUrl: `${getAppBaseUrl()}/dashboard/inquiries`,
    senderConfig: emailConfig,
  });

  sendEmailAsync({
    to,
    subject,
    html,
    tags: ["inquiry_received"],
  });
}

export async function queueInquiryReplySentEmail({
  inquiry,
  supplierName,
  productUrl,
}: {
  inquiry: Inquiry;
  supplierName?: string;
  productUrl?: string;
}) {
  if (!inquiry.buyer_email?.trim()) {
    logEmailFailure("queueInquiryReplySentEmail", "Buyer email is missing");
    return;
  }

  const resolvedSupplierName =
    supplierName?.trim() ||
    (await fetchProfileDisplayName(inquiry.supplier_user_id));

  const emailConfig = getEmailConfig();
  const { subject, html } = buildInquiryReplyEmail({
    buyerName: inquiry.buyer_name,
    productName: inquiry.product_name,
    supplierName: resolvedSupplierName,
    replyMessage: inquiry.reply_message ?? "",
    productUrl,
    senderConfig: emailConfig,
  });

  sendEmailAsync({
    to: inquiry.buyer_email.trim(),
    subject,
    html,
    tags: ["inquiry_replied"],
  });
}

export async function queueProductPublishedEmail({
  product,
  supplierName,
}: {
  product: Product;
  supplierName?: string;
}) {
  const recipient = await resolveRecipientEmail(product.user_id);
  const resolvedSupplierName =
    supplierName?.trim() ||
    recipient?.displayName ||
    (await fetchProfileDisplayName(product.user_id));
  const to = recipient?.email ?? buildDevFallbackEmail(product.user_id);
  const productUrl = product.slug
    ? `${getAppBaseUrl()}/product/${product.slug}`
    : `${getAppBaseUrl()}/dashboard/products`;

  const emailConfig = getEmailConfig();
  const { subject, html } = buildProductPublishedEmail({
    supplierName: resolvedSupplierName,
    productName: product.product_name || "Product",
    productUrl,
    senderConfig: emailConfig,
  });

  sendEmailAsync({
    to,
    subject,
    html,
    tags: ["product_published"],
  });
}
