"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

import ProductGallery from "@/components/products/ProductGallery";
import { uploadProductImage } from "@/lib/products";
import type { ProductImage } from "@/types/product";

const MAX_IMAGES = 8;

type ProductImageUploaderProps = {
  images: ProductImage[];
  userId: string;
  productId?: string;
  productName?: string;
  onImagesChange: (images: ProductImage[]) => void;
};

export default function ProductImageUploader({
  images,
  userId,
  productId,
  productName,
  onImagesChange,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const folder = productId ?? "drafts";
  const canAddMore = images.length < MAX_IMAGES;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    setError(null);
    setUploading(true);

    const uploaded: ProductImage[] = [];

    for (const file of toUpload) {
      const { data, error: uploadError } = await uploadProductImage(
        userId,
        folder,
        file,
        images.length + uploaded.length
      );

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      if (data) uploaded.push(data);
    }

    if (uploaded.length > 0) {
      onImagesChange([...images, ...uploaded]);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(index: number) {
    const next = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, order: i }));
    onImagesChange(next);
  }

  function handleSetCover(index: number) {
    if (index === 0) return;
    const reordered = [...images];
    const [cover] = reordered.splice(index, 1);
    reordered.unshift(cover);
    onImagesChange(reordered.map((img, i) => ({ ...img, order: i })));
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground">
            Product Images
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload up to {MAX_IMAGES} images. First image is the cover.
          </p>
        </div>
        {canAddMore && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <ImagePlus className="size-4" />
              {uploading ? "Uploading..." : "Add Images"}
            </button>
          </>
        )}
      </div>

      <div className="mt-4">
        <ProductGallery
          images={images}
          productName={productName}
          editable
          onRemove={handleRemove}
          onSetCover={handleSetCover}
        />
      </div>

      {images.length >= MAX_IMAGES && (
        <p className="mt-2 text-xs text-muted-foreground">
          Maximum of {MAX_IMAGES} images reached.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
