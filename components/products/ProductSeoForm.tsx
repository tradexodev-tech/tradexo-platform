"use client";

import { generateSlug } from "@/lib/product-utils";

type ProductSeoFormProps = {
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  slug: string;
  productName: string;
  slugManuallyEdited: boolean;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onMetaKeywordsChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSlugManuallyEdited: (value: boolean) => void;
  inputClass: string;
  labelClass: string;
};

export default function ProductSeoForm({
  seoTitle,
  seoDescription,
  metaKeywords,
  slug,
  productName,
  slugManuallyEdited,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onMetaKeywordsChange,
  onSlugChange,
  onSlugManuallyEdited,
  inputClass,
  labelClass,
}: ProductSeoFormProps) {
  function handleProductNameDerivedSlug(name: string) {
    if (!slugManuallyEdited) {
      onSlugChange(generateSlug(name));
    }
    if (!seoTitle) {
      onSeoTitleChange(name);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">SEO</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Optimize how your product appears in search and marketplace listings.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className={labelClass}>SEO Title</label>
          <input
            type="text"
            className={inputClass}
            placeholder={productName || "Product SEO title"}
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            onFocus={() => {
              if (!seoTitle && productName) onSeoTitleChange(productName);
            }}
          />
          {!seoTitle && productName && (
            <button
              type="button"
              className="mt-1 text-xs text-blue-600 hover:underline"
              onClick={() => handleProductNameDerivedSlug(productName)}
            >
              Use product name as SEO title
            </button>
          )}
        </div>

        <div>
          <label className={labelClass}>SEO Description</label>
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            placeholder="Brief description for search engines (150–160 characters recommended)"
            rows={3}
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {seoDescription.length} characters
          </p>
        </div>

        <div>
          <label className={labelClass}>Meta Keywords</label>
          <input
            type="text"
            className={inputClass}
            placeholder="steel pipes, industrial, export (comma-separated)"
            value={metaKeywords}
            onChange={(e) => onMetaKeywordsChange(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            className={inputClass}
            placeholder="industrial-steel-pipes"
            value={slug}
            onChange={(e) => {
              onSlugManuallyEdited(true);
              onSlugChange(generateSlug(e.target.value));
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-generated from product name. Edit to customize the URL path.
          </p>
        </div>
      </div>
    </div>
  );
}
