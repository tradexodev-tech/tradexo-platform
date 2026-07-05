"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import ProductDeleteDialog from "@/components/products/ProductDeleteDialog";
import ProductEmptyState from "@/components/products/ProductEmptyState";
import ProductForm from "@/components/products/ProductForm";
import ProductPreview from "@/components/products/ProductPreview";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

export default function ProductsManager() {
  const {
    products,
    userId,
    loading,
    loadError,
    actionMessage,
    drawerOpen,
    editingProduct,
    openAddDrawer,
    openEditDrawer,
    closeDrawer,
    saveDraft,
    publishProduct,
    removeProduct,
  } = useProducts();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useMemo(() => {
    const unique = new Set(
      products.map((p) => p.product_category).filter(Boolean)
    );
    return Array.from(unique).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (statusFilter === "all") {
      result = result.filter(
        (p) =>
          p.status === "draft" ||
          p.status === "published" ||
          p.status === "pending_approval"
      );
    } else {
      result = result.filter((p) => p.status === statusFilter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.product_name.toLowerCase().includes(query) ||
          p.product_category.toLowerCase().includes(query) ||
          p.brand_name.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.product_category === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
      }
      if (sortBy === "name") {
        return a.product_name.localeCompare(b.product_name);
      }
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    return result;
  }, [products, search, statusFilter, categoryFilter, sortBy]);

  const activeProductCount = useMemo(
    () =>
      products.filter(
        (p) =>
          p.status === "draft" ||
          p.status === "published" ||
          p.status === "pending_approval"
      ).length,
    [products]
  );

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const success = await removeProduct(deleteTarget);
    setDeleting(false);
    if (success) setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  const showEmptyCatalog = activeProductCount === 0 && !loadError;
  const showNoResults =
    !showEmptyCatalog && filteredProducts.length === 0 && products.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="mt-1 text-muted-foreground">
            Manage all your export products.
          </p>
        </div>
        <Button onClick={openAddDrawer} className="shrink-0">
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}. Ensure the products table exists in Supabase.
        </div>
      )}

      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      <div className="space-y-3 border-b pb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${selectClass} sm:flex-1`}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`${selectClass} sm:flex-1`}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${selectClass} sm:flex-1`}
            aria-label="Sort products"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      {showEmptyCatalog ? (
        <ProductEmptyState onAddProduct={openAddDrawer} />
      ) : showNoResults ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPreview={setPreviewTarget}
              onEdit={openEditDrawer}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ProductForm
        open={drawerOpen}
        product={editingProduct}
        userId={userId}
        onClose={closeDrawer}
        onSaveDraft={saveDraft}
        onPublish={publishProduct}
      />

      {previewTarget && (
        <ProductPreview
          open={Boolean(previewTarget)}
          product={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      <ProductDeleteDialog
        open={Boolean(deleteTarget)}
        productName={deleteTarget?.product_name ?? ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
