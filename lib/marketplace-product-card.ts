import type { MarketplaceProduct } from "@/lib/product-public";
import { parseProductImages } from "@/types/product";

export function getMarketplaceProductImageUrl(product: MarketplaceProduct) {
  const images = parseProductImages(product.product_images);
  return images[0]?.url ?? null;
}

export function getMarketplaceProductExcerpt(product: MarketplaceProduct) {
  const short = product.short_description?.trim();
  if (short) return short;

  const full = product.full_description?.trim();
  if (full) {
    return full.length > 140 ? `${full.slice(0, 137)}...` : full;
  }

  return "No description provided.";
}

export function formatMarketplaceProductPrice(product: MarketplaceProduct) {
  if (product.price_on_request) {
    return "Price on request";
  }

  if (product.price != null) {
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(product.price);

    return `${product.currency || "USD"} ${formatted}`;
  }

  return "Contact for price";
}

export function formatMarketplaceMoq(product: MarketplaceProduct) {
  const moq = product.moq?.trim();
  const unit = product.unit?.trim();

  if (!moq) return "MOQ: —";
  if (unit) return `MOQ: ${moq} ${unit}`;
  return `MOQ: ${moq}`;
}

export function formatMarketplaceLeadTime(product: MarketplaceProduct) {
  const leadTime = product.lead_time?.trim();
  return leadTime ? `Lead time: ${leadTime}` : "Lead time: —";
}

export function getMarketplaceProductHref(product: MarketplaceProduct) {
  return product.slug?.trim() ? `/product/${product.slug}` : null;
}

export function getMarketplaceCompanyHref(product: MarketplaceProduct) {
  const slug = product.company?.company_slug?.trim();
  return slug ? `/company/${slug}` : null;
}
