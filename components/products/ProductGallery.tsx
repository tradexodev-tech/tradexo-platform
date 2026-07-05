"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/types/product";

type ProductGalleryProps = {
  images: ProductImage[];
  productName?: string;
  editable?: boolean;
  onRemove?: (index: number) => void;
  onSetCover?: (index: number) => void;
};

export default function ProductGallery({
  images,
  productName = "Product",
  editable = false,
  onRemove,
  onSetCover,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const activeImage = sorted[activeIndex];

  useEffect(() => {
    if (activeIndex >= sorted.length && sorted.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, sorted.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveIndex((i) => Math.min(i + 1, sorted.length - 1));
      if (e.key === "ArrowLeft") setActiveIndex((i) => Math.max(i - 1, 0));
    }
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, sorted.length]);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted">
        <p className="text-sm text-muted-foreground">No images uploaded</p>
      </div>
    );
  }

  function openLightbox(index: number) {
    setActiveIndex(index);
    setZoom(1);
    setLightboxOpen(true);
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.url}
            alt={productName}
            className="size-full object-contain transition-transform group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {sorted.length}
          </span>
          <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Cover
          </span>
        </button>

        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sorted.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  onDoubleClick={() => openLightbox(index)}
                  className={`size-16 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === activeIndex
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="size-full object-cover"
                  />
                </button>
                {editable && index !== 0 && onSetCover && (
                  <button
                    type="button"
                    onClick={() => onSetCover(index)}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1 py-0.5 text-[9px] font-medium text-blue-600 shadow ring-1 ring-border"
                  >
                    Set cover
                  </button>
                )}
                {editable && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 shadow ring-1 ring-border"
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && activeImage && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium">
              {activeIndex + 1} / {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 text-white hover:bg-white/10 disabled:opacity-30"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((i) => i - 1)}
            >
              <ChevronLeft className="size-6" />
            </Button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage.url}
              alt={productName}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 text-white hover:bg-white/10 disabled:opacity-30"
              disabled={activeIndex === sorted.length - 1}
              onClick={() => setActiveIndex((i) => i + 1)}
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
