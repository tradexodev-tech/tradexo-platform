export const PRODUCT_SHARE_EMAIL_SUBJECT = "Check out this product on Tradexo";

export type ProductShareNativeResult = "shared" | "aborted" | "failed";

export type ProductShareNativeOptions = {
  title: string;
  url: string;
  text?: string;
};

export function buildProductShareUrl(slug: string) {
  const trimmedSlug = slug.trim();

  if (typeof window === "undefined") {
    return `/product/${trimmedSlug}`;
  }

  return `${window.location.origin}/product/${trimmedSlug}`;
}

export function buildWhatsAppShareUrl(productUrl: string) {
  return `https://wa.me/?text=${encodeURIComponent(productUrl)}`;
}

export function buildLinkedInShareUrl(productUrl: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
}

export function buildEmailShareUrl(productUrl: string) {
  const params = new URLSearchParams({
    subject: PRODUCT_SHARE_EMAIL_SUBJECT,
    body: productUrl,
  });

  return `mailto:?${params.toString()}`;
}

export function isWebShareSupported() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareProductNatively(
  options: ProductShareNativeOptions
): Promise<ProductShareNativeResult> {
  if (!isWebShareSupported()) {
    return "failed";
  }

  try {
    await navigator.share(options);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "aborted";
    }

    return "failed";
  }
}

export async function copyProductShareUrl(productUrl: string) {
  if (typeof navigator === "undefined") {
    return { ok: false as const, error: "Clipboard is unavailable." };
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(productUrl);
      return { ok: true as const };
    }

    const textarea = document.createElement("textarea");
    textarea.value = productUrl;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      return { ok: false as const, error: "Unable to copy link." };
    }

    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Unable to copy link." };
  }
}

export function openShareDestination(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
