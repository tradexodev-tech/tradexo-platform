"use client";

import { X } from "lucide-react";

import ProductGallery from "@/components/products/ProductGallery";
import ProductStatusBadge from "@/components/products/ProductStatusBadge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type ProductPreviewProps = {
  open: boolean;
  product: Product;
  onClose: () => void;
};

function formatPrice(product: Product) {
  if (product.price_on_request) return "Price on request";
  if (product.price != null) return `${product.currency} ${product.price}`;
  return "Contact for price";
}

export default function ProductPreview({
  open,
  product,
  onClose,
}: ProductPreviewProps) {
  if (!open) return null;

  const specs = [
    { label: "Material", value: product.specifications.material },
    { label: "Size / Dimensions", value: product.specifications.size_dimensions },
    { label: "Weight", value: product.specifications.weight },
    { label: "Color", value: product.specifications.color },
    { label: "Packaging", value: product.specifications.packaging },
    ...product.specifications.custom.filter((item) => item.label || item.value),
  ].filter((item) => item.value);

  return (
    <>
      <div
        className="fixed inset-0 z-[55] bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-4 z-[56] mx-auto flex max-w-4xl flex-col overflow-hidden rounded-xl border bg-white shadow-2xl md:inset-8"
        role="dialog"
        aria-modal="true"
        aria-label="Product preview"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
              Buyer Preview
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              How buyers will see this product
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <ProductGallery
              images={product.product_images}
              productName={product.product_name}
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ProductStatusBadge status={product.status} />
                <span className="text-sm text-muted-foreground">
                  {product.product_category}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold text-foreground">
                {product.product_name || "Untitled Product"}
              </h1>

              {product.brand_name && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Brand: {product.brand_name}
                </p>
              )}

              <p className="mt-4 text-2xl font-semibold text-blue-700">
                {formatPrice(product)}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {product.short_description || product.full_description || "No description provided."}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Country of Origin</dt>
                  <dd className="mt-1 font-medium">{product.country_of_origin || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">MOQ</dt>
                  <dd className="mt-1 font-medium">{product.moq || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Lead Time</dt>
                  <dd className="mt-1 font-medium">{product.lead_time || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">HS Code</dt>
                  <dd className="mt-1 font-medium">{product.hs_code || "—"}</dd>
                </div>
              </dl>

              {product.full_description && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {product.full_description}
                  </p>
                </div>
              )}

              {specs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
                  <dl className="mt-2 space-y-2">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between gap-4 border-b pb-2 text-sm last:border-0"
                      >
                        <dt className="text-muted-foreground">{spec.label}</dt>
                        <dd className="font-medium text-foreground">
                          {"value" in spec ? spec.value : ""}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {product.variants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground">Variants</h3>
                  <div className="mt-2 space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="rounded-lg border bg-background p-3 text-sm"
                      >
                        <p className="font-medium">{variant.variant_name || "Variant"}</p>
                        <p className="mt-1 text-muted-foreground">
                          SKU: {variant.sku || "—"} · MOQ: {variant.moq || "—"}
                          {variant.price != null && ` · ${product.currency} ${variant.price}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="mt-8 w-full" disabled>
                Request Quote
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Preview only — buyers will see this layout in the marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
