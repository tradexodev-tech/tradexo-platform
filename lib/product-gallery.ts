import { parseProductImages, type ProductImage } from "@/types/product";

export type GalleryImage = {
  url: string;
  order: number;
  uploaded_at: string;
};

export const GALLERY_PLACEHOLDER_MESSAGE = "No product image available";

export function normalizeProductGalleryImages(
  images: ProductImage[] | unknown
): GalleryImage[] {
  const parsed = Array.isArray(images) ? parseProductImages(images) : [];

  return parsed
    .filter((image) => Boolean(image.url?.trim()))
    .map((image, index) => ({
      url: image.url.trim(),
      order: image.order ?? index,
      uploaded_at: image.uploaded_at ?? "",
    }))
    .sort((a, b) => a.order - b.order);
}

export function hasGalleryImages(images: GalleryImage[]) {
  return images.length > 0;
}

export function clampGalleryIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

export function getNextGalleryIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return index >= total - 1 ? 0 : index + 1;
}

export function getPreviousGalleryIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return index <= 0 ? total - 1 : index - 1;
}

export function getGalleryImageAlt(
  productName: string,
  index: number,
  total: number
) {
  const name = productName.trim() || "Product";

  if (total <= 1) {
    return name;
  }

  return `${name} image ${index + 1} of ${total}`;
}

export function getGalleryThumbnailAlt(
  productName: string,
  index: number,
  total: number
) {
  const name = productName.trim() || "Product";
  return `${name} thumbnail ${index + 1} of ${total}`;
}
