"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";

import ProductDeleteDialog from "@/components/products/ProductDeleteDialog";
import ProductForm from "@/components/products/ProductForm";
import ProductGallery from "@/components/products/ProductGallery";
import ProductPreview from "@/components/products/ProductPreview";
import ProductStatusBadge from "@/components/products/ProductStatusBadge";
import { Button } from "@/components/ui/button";
import {
  deleteProduct,
  fetchProduct,
  getCurrentUserId,
  updateProduct,
} from "@/lib/products";
import type { Product, ProductFormInput } from "@/types/product";

function formatDate(dateString: string) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type ProductDetailManagerProps = {
  productId: string;
};

export default function ProductDetailManager({
  productId,
}: ProductDetailManagerProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { userId: uid } = await getCurrentUserId();
    setUserId(uid);

    const { data, error } = await fetchProduct(productId);
    if (error || !data) {
      setLoadError(error?.message ?? "Product not found.");
      setProduct(null);
    } else {
      setProduct(data);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function handleSaveDraft(input: ProductFormInput) {
    if (!product) return;
    const { error } = await updateProduct(product.id, input, "draft");
    if (error) throw new Error(error.message);
    setActionMessage("Product saved as draft.");
    await loadProduct();
  }

  async function handlePublish(input: ProductFormInput) {
    if (!product) return;
    const { error } = await updateProduct(product.id, input, "published");
    if (error) throw new Error(error.message);
    setActionMessage("Product published successfully.");
    await loadProduct();
  }

  async function handleDeleteConfirm() {
    if (!product) return;
    setDeleting(true);
    const { error } = await deleteProduct(product.id);
    setDeleting(false);
    if (error) {
      setActionMessage(`Failed to delete: ${error.message}`);
      setDeleteOpen(false);
      return;
    }
    router.push("/dashboard/products");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Products
        </Link>
        <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">Product not found</p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
        </div>
      </div>
    );
  }

  const images = product.product_images;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {product.product_name || "Untitled Product"}
            </h2>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="mt-1 text-muted-foreground">
            {product.product_category || "Uncategorized"} · Updated{" "}
            {formatDate(product.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ProductGallery
            images={images}
            productName={product.product_name}
          />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Short Description</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.short_description || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Full Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {product.full_description || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Brand</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.brand_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Model Number</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.model_number || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">HS Code</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.hs_code || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Country of Origin</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.country_of_origin || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">MOQ</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.moq || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Unit</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.unit || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Production Capacity</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.production_capacity || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Lead Time</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.lead_time || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Price</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.price_on_request
                  ? "Price on request"
                  : product.price != null
                    ? `${product.currency} ${product.price}`
                    : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Certifications</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.certifications || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Slug</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.slug || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {(product.specifications.material ||
        product.specifications.custom.length > 0) && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Material", value: product.specifications.material },
              {
                label: "Size / Dimensions",
                value: product.specifications.size_dimensions,
              },
              { label: "Weight", value: product.specifications.weight },
              { label: "Color", value: product.specifications.color },
              { label: "Packaging", value: product.specifications.packaging },
              ...product.specifications.custom,
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label}>
                  <dt className="text-sm text-muted-foreground">{item.label}</dt>
                  <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {product.variants.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Variants</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {product.variants.map((variant) => (
              <div key={variant.id} className="rounded-lg border bg-muted/20 p-4">
                <p className="font-medium text-foreground">
                  {variant.variant_name || "Variant"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  SKU: {variant.sku || "—"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  MOQ: {variant.moq || "—"} · Unit: {variant.unit || "—"}
                </p>
                {variant.price != null && (
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {product.currency} {variant.price}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(product.seo_title || product.seo_description || product.meta_keywords) && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">SEO</h3>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">SEO Title</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.seo_title || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">SEO Description</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.seo_description || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Meta Keywords</dt>
              <dd className="mt-1 text-sm text-foreground">
                {product.meta_keywords || "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <ProductForm
        open={drawerOpen}
        product={product}
        userId={userId}
        onClose={() => setDrawerOpen(false)}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <ProductPreview
        open={previewOpen}
        product={product}
        onClose={() => setPreviewOpen(false)}
      />

      <ProductDeleteDialog
        open={deleteOpen}
        productName={product.product_name}
        deleting={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
