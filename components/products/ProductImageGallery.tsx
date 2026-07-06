"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, Package, X } from "lucide-react";

import {
  clampGalleryIndex,
  getGalleryImageAlt,
  getGalleryThumbnailAlt,
  getNextGalleryIndex,
  getPreviousGalleryIndex,
  GALLERY_PLACEHOLDER_MESSAGE,
  hasGalleryImages,
  normalizeProductGalleryImages,
  type GalleryImage,
} from "@/lib/product-gallery";
import type { ProductImage } from "@/types/product";

type ProductImageGalleryProps = {
  images: ProductImage[] | unknown;
  productName?: string;
};

export default function ProductImageGallery({
  images,
  productName = "Product",
}: ProductImageGalleryProps) {
  const galleryId = useId();
  const mainImageTriggerRef = useRef<HTMLButtonElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const galleryImages = useMemo(
    () => normalizeProductGalleryImages(images),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeIndex = clampGalleryIndex(activeIndex, galleryImages.length);
  const activeImage = galleryImages[safeIndex];
  const hasImages = hasGalleryImages(galleryImages);
  const hasMultipleImages = galleryImages.length > 1;

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(clampGalleryIndex(index, galleryImages.length));
    setLightboxOpen(true);
  }, [galleryImages.length]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    mainImageTriggerRef.current?.focus();
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      getPreviousGalleryIndex(current, galleryImages.length)
    );
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      getNextGalleryIndex(current, galleryImages.length)
    );
  }, [galleryImages.length]);

  const handleThumbnailSelect = useCallback((index: number) => {
    setActiveIndex(clampGalleryIndex(index, galleryImages.length));
  }, [galleryImages.length]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStartXRef.current === null || !hasMultipleImages) {
        return;
      }

      const endX = event.changedTouches[0]?.clientX;
      if (endX == null) {
        touchStartXRef.current = null;
        return;
      }

      const deltaX = endX - touchStartXRef.current;
      const swipeThreshold = 48;

      if (deltaX > swipeThreshold) {
        showPrevious();
      } else if (deltaX < -swipeThreshold) {
        showNext();
      }

      touchStartXRef.current = null;
    },
    [hasMultipleImages, showNext, showPrevious]
  );

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    lightboxCloseRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, lightboxOpen, showNext, showPrevious]);

  if (!hasImages) {
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted"
        role="img"
        aria-label={GALLERY_PLACEHOLDER_MESSAGE}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="size-10" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm">{GALLERY_PLACEHOLDER_MESSAGE}</p>
        </div>
      </div>
    );
  }

  const mainAlt = getGalleryImageAlt(
    productName,
    safeIndex,
    galleryImages.length
  );

  return (
    <>
      <section
        aria-label={`${productName} image gallery`}
        className="space-y-3 lg:space-y-4"
      >
        <button
          ref={mainImageTriggerRef}
          id={`${galleryId}-main-image`}
          type="button"
          onClick={() => openLightbox(safeIndex)}
          className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={`View ${mainAlt} in full screen`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.url}
            alt={mainAlt}
            fetchPriority="high"
            decoding="async"
            className="size-full object-contain transition-transform duration-300 md:group-hover:scale-[1.06]"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {safeIndex + 1} / {galleryImages.length}
          </span>
        </button>

        {hasMultipleImages ? (
          <div
            role="tablist"
            aria-label={`${productName} image thumbnails`}
            className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 xl:grid-cols-6"
          >
            {galleryImages.map((image: GalleryImage, index) => {
              const isSelected = index === safeIndex;
              const thumbnailId = `${galleryId}-thumb-${index}`;

              return (
                <button
                  key={`${image.url}-${index}`}
                  id={thumbnailId}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${galleryId}-main-image`}
                  onClick={() => handleThumbnailSelect(index)}
                  className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:size-20 ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={getGalleryThumbnailAlt(
                      productName,
                      index,
                      galleryImages.length
                    )}
                    loading="lazy"
                    decoding="async"
                    className="size-16 object-cover lg:size-full"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {lightboxOpen && activeImage ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            ref={lightboxCloseRef}
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close image viewer"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative flex max-h-[85vh] w-full max-w-5xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            {hasMultipleImages ? (
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-0 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 sm:left-2"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-7" />
              </button>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={mainAlt}
              className="max-h-[85vh] max-w-full object-contain"
            />

            {hasMultipleImages ? (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-0 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30 sm:right-2"
                aria-label="Next image"
              >
                <ChevronRight className="size-7" />
              </button>
            ) : null}
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-white">
            {safeIndex + 1} / {galleryImages.length}
          </p>
        </div>
      ) : null}
    </>
  );
}
