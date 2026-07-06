import { Suspense } from "react";

import ProductImageGallery from "@/components/products/ProductImageGallery";
import {
  RelatedProductsSection,
  RelatedProductsSkeleton,
} from "@/components/products/RelatedProducts";
import PublicCompanySummary from "@/components/company/PublicCompanySummary";
import ProductContactSupplier from "@/components/inquiries/ProductContactSupplier";
import type { PublicCompanyProfile } from "@/types/company";
import type { Product } from "@/types/product";

type PublicProductViewProps = {
  product: Product;
  company: PublicCompanyProfile | null;
};

function formatPrice(product: Product) {
  if (product.price_on_request) return "Price on request";
  if (product.price != null) return `${product.currency} ${product.price}`;
  return "Contact for price";
}

function buildSpecifications(product: Product) {
  return [
    { label: "Material", value: product.specifications.material },
    { label: "Size / Dimensions", value: product.specifications.size_dimensions },
    { label: "Weight", value: product.specifications.weight },
    { label: "Color", value: product.specifications.color },
    { label: "Packaging", value: product.specifications.packaging },
    ...product.specifications.custom.filter((item) => item.label || item.value),
  ].filter((item) => item.value);
}

export default function PublicProductView({
  product,
  company,
}: PublicProductViewProps) {
  const specifications = buildSpecifications(product);

  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery
            images={product.product_images}
            productName={product.product_name}
          />

          <div>
            <p className="text-sm font-medium text-blue-600">
              {product.product_category || "Uncategorized"}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.product_name || "Product"}
            </h1>

            {product.brand_name && (
              <p className="mt-2 text-sm text-muted-foreground">
                Brand: {product.brand_name}
              </p>
            )}

            <p className="mt-4 text-2xl font-semibold text-blue-700">
              {formatPrice(product)}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {product.short_description ||
                product.full_description ||
                "No description provided."}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Country of Origin</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.country_of_origin || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">MOQ</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.moq || "—"}
                  {product.unit ? ` ${product.unit}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lead Time</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.lead_time || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">HS Code</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {product.hs_code || "—"}
                </dd>
              </div>
              {product.model_number && (
                <div>
                  <dt className="text-muted-foreground">Model Number</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {product.model_number}
                  </dd>
                </div>
              )}
              {product.production_capacity && (
                <div>
                  <dt className="text-muted-foreground">Production Capacity</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {product.production_capacity}
                  </dd>
                </div>
              )}
              {product.certifications && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Certifications</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {product.certifications}
                  </dd>
                </div>
              )}
            </dl>

            <ProductContactSupplier
              productName={product.product_name}
              productId={product.id}
              supplierUserId={product.user_id}
            />          </div>
        </div>

        {product.full_description && (
          <section className="mt-10 border-t pt-8">
            <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {product.full_description}
            </p>
          </section>
        )}

        {specifications.length > 0 && (
          <section className="mt-10 border-t pt-8">
            <h2 className="text-lg font-semibold text-foreground">Specifications</h2>
            <dl className="mt-4 divide-y rounded-xl border bg-card">
              {specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4"
                >
                  <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                  <dd className="text-sm font-medium text-foreground sm:text-right">
                    {"value" in spec ? spec.value : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {product.variants.length > 0 && (
          <section className="mt-10 border-t pt-8">
            <h2 className="text-lg font-semibold text-foreground">Variants</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-xl border bg-card p-4 text-sm shadow-sm"
                >
                  <p className="font-semibold text-foreground">
                    {variant.variant_name || "Variant"}
                  </p>
                  <dl className="mt-3 space-y-2 text-muted-foreground">
                    <div className="flex justify-between gap-4">
                      <dt>SKU</dt>
                      <dd className="font-medium text-foreground">
                        {variant.sku || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>MOQ</dt>
                      <dd className="font-medium text-foreground">
                        {variant.moq || "—"}
                        {variant.unit ? ` ${variant.unit}` : ""}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Price</dt>
                      <dd className="font-medium text-foreground">
                        {variant.price != null
                          ? `${product.currency} ${variant.price}`
                          : "Contact for price"}
                      </dd>
                    </div>
                    {variant.stock_status && (
                      <div className="flex justify-between gap-4">
                        <dt>Stock</dt>
                        <dd className="font-medium text-foreground">
                          {variant.stock_status}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {company && (
          <div className="mt-10 border-t pt-8">
            <PublicCompanySummary company={company} />
          </div>
        )}

        <Suspense fallback={<RelatedProductsSkeleton />}>
          <RelatedProductsSection
            input={{
              productId: product.id,
              productCategory: product.product_category,
              supplierUserId: product.user_id,
              supplierIndustry: company?.industry,
            }}
          />
        </Suspense>
      </div>
    </main>
  );
}
