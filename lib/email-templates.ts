export type EmailSenderConfig = {
  fromName: string;
  fromAddress: string;
};

export type EmailTemplateParams = {
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  previewText?: string;
  senderConfig: EmailSenderConfig;
};

export type WelcomeEmailParams = {
  recipientName: string;
  dashboardUrl: string;
  senderConfig: EmailSenderConfig;
};

export type NewInquiryEmailParams = {
  supplierName: string;
  buyerName: string;
  buyerCompany?: string | null;
  productName: string;
  inquiryMessage: string;
  dashboardUrl: string;
  senderConfig: EmailSenderConfig;
};

export type InquiryReplyEmailParams = {
  buyerName: string;
  productName: string;
  supplierName: string;
  replyMessage: string;
  productUrl?: string;
  senderConfig: EmailSenderConfig;
};

export type ProductPublishedEmailParams = {
  supplierName: string;
  productName: string;
  productUrl: string;
  senderConfig: EmailSenderConfig;
};

const TRADEXO_BRAND_COLOR = "#2563eb";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphHtml(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(text)}</p>`;
}

export function renderEmailLayout({
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  previewText,
  senderConfig,
}: EmailTemplateParams) {
  const safeHeading = escapeHtml(heading);
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);
  const safePreview = escapeHtml(previewText ?? heading);
  const safeFromName = escapeHtml(senderConfig.fromName);
  const safeFromAddress = escapeHtml(senderConfig.fromAddress);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${safeHeading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background-color:${TRADEXO_BRAND_COLOR};color:#ffffff;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:24px;font-weight:700;line-height:1.2;">${safeFromName}</td>
                  </tr>
                  <tr>
                    <td style="padding-top:4px;font-size:13px;line-height:1.4;opacity:0.9;">Global B2B Trade Platform</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#0f172a;">${safeHeading}</h1>
                ${bodyHtml}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  <tr>
                    <td>
                      <a href="${safeCtaUrl}" style="display:inline-block;padding:12px 20px;background-color:${TRADEXO_BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">${safeCtaLabel}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                  You are receiving this email because of activity on your ${safeFromName} account.
                </p>
                <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                  Sent from ${safeFromName} &lt;${safeFromAddress}&gt;
                </p>
                <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                  &copy; ${new Date().getFullYear()} ${safeFromName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildWelcomeEmail({
  recipientName,
  dashboardUrl,
  senderConfig,
}: WelcomeEmailParams) {
  const fromName = senderConfig.fromName;

  const bodyHtml = [
    paragraphHtml(`Hi ${recipientName},`),
    paragraphHtml(
      `Welcome to ${fromName}. Your account is ready, and you can start connecting with global buyers and suppliers.`
    ),
    paragraphHtml(
      "Complete your company profile, publish products, and explore the marketplace to grow your international trade business."
    ),
  ].join("");

  return {
    subject: `Welcome to ${fromName}`,
    html: renderEmailLayout({
      heading: `Welcome to ${fromName}`,
      bodyHtml,
      ctaLabel: "Go to Dashboard",
      ctaUrl: dashboardUrl,
      previewText: `Your ${fromName} account is ready.`,
      senderConfig,
    }),
  };
}

export function buildNewInquiryEmail({
  supplierName,
  buyerName,
  buyerCompany,
  productName,
  inquiryMessage,
  dashboardUrl,
  senderConfig,
}: NewInquiryEmailParams) {
  const fromName = senderConfig.fromName;
  const companyLine = buyerCompany
    ? paragraphHtml(`Company: ${buyerCompany}`)
    : "";

  const bodyHtml = [
    paragraphHtml(`Hi ${supplierName},`),
    paragraphHtml(
      `You received a new inquiry from ${buyerName} for ${productName}.`
    ),
    companyLine,
    paragraphHtml(`Message: ${inquiryMessage}`),
    paragraphHtml(`Review the inquiry and respond from your ${fromName} dashboard.`),
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: `New inquiry for ${productName}`,
    html: renderEmailLayout({
      heading: "New Inquiry Received",
      bodyHtml,
      ctaLabel: "View Inquiry",
      ctaUrl: dashboardUrl,
      previewText: `${buyerName} sent a new inquiry for ${productName}.`,
      senderConfig,
    }),
  };
}

export function buildInquiryReplyEmail({
  buyerName,
  productName,
  supplierName,
  replyMessage,
  productUrl,
  senderConfig,
}: InquiryReplyEmailParams) {
  const fromName = senderConfig.fromName;

  const bodyHtml = [
    paragraphHtml(`Hi ${buyerName},`),
    paragraphHtml(
      `${supplierName} replied to your inquiry about ${productName}.`
    ),
    paragraphHtml(`Reply: ${replyMessage}`),
    paragraphHtml(`You can continue the conversation through ${fromName}.`),
  ].join("");

  return {
    subject: `Reply to your inquiry about ${productName}`,
    html: renderEmailLayout({
      heading: "Inquiry Reply Received",
      bodyHtml,
      ctaLabel: productUrl ? "View Product" : `Visit ${fromName}`,
      ctaUrl: productUrl ?? "https://tradexo.io",
      previewText: `${supplierName} replied to your inquiry.`,
      senderConfig,
    }),
  };
}

export function buildProductPublishedEmail({
  supplierName,
  productName,
  productUrl,
  senderConfig,
}: ProductPublishedEmailParams) {
  const fromName = senderConfig.fromName;

  const bodyHtml = [
    paragraphHtml(`Hi ${supplierName},`),
    paragraphHtml(
      `Your product ${productName} is now live on the ${fromName} marketplace.`
    ),
    paragraphHtml(
      "Buyers can discover your listing, view details, and send inquiries directly from your public product page."
    ),
  ].join("");

  return {
    subject: `Your product is live: ${productName}`,
    html: renderEmailLayout({
      heading: "Product Published",
      bodyHtml,
      ctaLabel: "View Live Product",
      ctaUrl: productUrl,
      previewText: `${productName} is now published on ${fromName}.`,
      senderConfig,
    }),
  };
}
