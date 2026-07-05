"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";

import ProductImageUploader from "@/components/products/ProductImageUploader";
import ProductPreview from "@/components/products/ProductPreview";
import ProductSeoForm from "@/components/products/ProductSeoForm";
import ProductSpecificationsForm from "@/components/products/ProductSpecificationsForm";
import ProductStatusBadge from "@/components/products/ProductStatusBadge";
import ProductVariantsForm from "@/components/products/ProductVariantsForm";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/product-utils";
import type { Product, ProductFormInput } from "@/types/product";
import {
  emptyProductForm,
  formInputToPreviewProduct,
  productToFormInput,
} from "@/types/product";

const CATEGORIES = [
  "Agriculture & Food",
  "Automotive Parts",
  "Chemicals",
  "Consumer Electronics",
  "Industrial Machinery",
  "Medical Devices",
  "Metals & Minerals",
  "Packaging Materials",
  "Pharmaceuticals",
  "Textiles & Apparel",
  "Other",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Japan",
  "UAE",
  "China",
  "Singapore",
  "Australia",
  "Canada",
];

const UNITS = [
  "Pieces",
  "Kilograms",
  "Metric Tons",
  "Cartons",
  "Pallets",
  "Containers",
  "Sets",
  "Meters",
  "Liters",
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CNY", "AED", "JPY"];

type ProductFormProps = {
  open: boolean;
  product?: Product | null;
  userId?: string | null;
  onClose: () => void;
  onSaveDraft: (input: ProductFormInput) => Promise<void>;
  onPublish: (input: ProductFormInput) => Promise<void>;
};

export default function ProductForm({
  open,
  product,
  userId,
  onClose,
  onSaveDraft,
  onPublish,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormInput>(emptyProductForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(product ? productToFormInput(product) : emptyProductForm);
      setSlugManuallyEdited(Boolean(product?.slug));
      setPreviewOpen(false);
      setError(null);
    }
  }, [open, product]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function updateField<K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleProductNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      product_name: name,
      slug: slugManuallyEdited ? prev.slug : generateSlug(name),
    }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      await onSaveDraft(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!form.product_name.trim()) {
      setError("Product name is required to publish.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onPublish(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish product.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-2 block text-sm font-medium text-foreground";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={product ? "Edit product" : "Add product"}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {product ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {product
                ? "Update product details and republish."
                : "Create a new export product listing."}
            </p>
            {product && (
              <div className="mt-1">
                <ProductStatusBadge status={product.status} />
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Industrial Steel Pipes"
                  value={form.product_name}
                  onChange={(e) => handleProductNameChange(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={form.product_category}
                  onChange={(e) =>
                    updateField("product_category", e.target.value)
                  }
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Brand</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Brand name"
                  value={form.brand_name}
                  onChange={(e) => updateField("brand_name", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Model Number</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Model / SKU"
                  value={form.model_number}
                  onChange={(e) => updateField("model_number", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Short Description</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Brief product summary for listings"
                  value={form.short_description}
                  onChange={(e) =>
                    updateField("short_description", e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Full Description</label>
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder="Detailed specifications, features, and applications..."
                  rows={4}
                  value={form.full_description}
                  onChange={(e) =>
                    updateField("full_description", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>HS Code</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 7304.19"
                  value={form.hs_code}
                  onChange={(e) => updateField("hs_code", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Country of Origin</label>
                <select
                  className={inputClass}
                  value={form.country_of_origin}
                  onChange={(e) =>
                    updateField("country_of_origin", e.target.value)
                  }
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>MOQ</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 1000 pieces"
                  value={form.moq}
                  onChange={(e) => updateField("moq", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Unit</label>
                <select
                  className={inputClass}
                  value={form.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                >
                  <option value="">Select unit</option>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Production Capacity</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 50,000 units/month"
                  value={form.production_capacity}
                  onChange={(e) =>
                    updateField("production_capacity", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Lead Time</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 15–30 days"
                  value={form.lead_time}
                  onChange={(e) => updateField("lead_time", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Price On Request
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hide price and show &quot;Request Quote&quot; instead
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.price_on_request}
                    onClick={() =>
                      updateField("price_on_request", !form.price_on_request)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                      form.price_on_request ? "bg-blue-600" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                        form.price_on_request ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {!form.price_on_request && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Currency</label>
                      <select
                        className={inputClass}
                        value={form.currency}
                        onChange={(e) => updateField("currency", e.target.value)}
                      >
                        {CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Price</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={inputClass}
                        placeholder="0.00"
                        value={form.price ?? ""}
                        onChange={(e) =>
                          updateField(
                            "price",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Certifications</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="ISO 9001, CE, FDA (comma-separated)"
                  value={form.certifications}
                  onChange={(e) =>
                    updateField("certifications", e.target.value)
                  }
                />
              </div>

              {userId && (
                <div className="sm:col-span-2">
                  <ProductImageUploader
                    images={form.product_images}
                    userId={userId}
                    productId={product?.id}
                    productName={form.product_name}
                    onImagesChange={(images) =>
                      updateField("product_images", images)
                    }
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className={labelClass}>Product Video URL</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.product_video}
                  onChange={(e) => updateField("product_video", e.target.value)}
                />
              </div>
            </div>

            <ProductSpecificationsForm
              specifications={form.specifications}
              onChange={(specifications) =>
                updateField("specifications", specifications)
              }
              inputClass={inputClass}
              labelClass={labelClass}
            />

            <ProductVariantsForm
              variants={form.variants}
              onChange={(variants) => updateField("variants", variants)}
              inputClass={inputClass}
              labelClass={labelClass}
            />

            <ProductSeoForm
              seoTitle={form.seo_title}
              seoDescription={form.seo_description}
              metaKeywords={form.meta_keywords}
              slug={form.slug}
              productName={form.product_name}
              slugManuallyEdited={slugManuallyEdited}
              onSeoTitleChange={(value) => updateField("seo_title", value)}
              onSeoDescriptionChange={(value) =>
                updateField("seo_description", value)
              }
              onMetaKeywordsChange={(value) =>
                updateField("meta_keywords", value)
              }
              onSlugChange={(value) => updateField("slug", value)}
              onSlugManuallyEdited={setSlugManuallyEdited}
              inputClass={inputClass}
              labelClass={labelClass}
            />

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t bg-gray-50/80 px-6 py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="size-4" />
              Preview
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Button type="button" disabled={saving} onClick={handlePublish}>
                {saving ? "Saving..." : "Publish Product"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <ProductPreview
        open={previewOpen}
        product={formInputToPreviewProduct(form, "published")}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
