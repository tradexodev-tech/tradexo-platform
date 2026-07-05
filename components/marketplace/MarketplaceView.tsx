import { Suspense } from "react";

import ProductCard from "@/components/products/ProductCard";
import MarketplaceFiltersBar from "@/components/marketplace/MarketplaceFiltersBar";
import type { MarketplaceFilters, MarketplaceProduct } from "@/lib/product-public";

type MarketplaceViewProps = {
  products: MarketplaceProduct[];
  filters: Required<Pick<MarketplaceFilters, "sort">> & MarketplaceFilters;
  errorMessage?: string | null;
};

export default function MarketplaceView({
  products,
  filters,
  errorMessage,
}: MarketplaceViewProps) {
  const hasActiveFilters = Boolean(
    filters.search?.trim() ||
      filters.category?.trim() ||
      filters.country?.trim() ||
      filters.industry?.trim()
  );

  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse published products from verified global suppliers.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <Suspense
          fallback={
            <div className="space-y-3 border-b pb-6">
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
                <div className="h-10 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          }
        >
          <MarketplaceFiltersBar filters={filters} />
        </Suspense>

        {products.length === 0 ? (
          <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-foreground">
              {hasActiveFilters ? "No products found" : "No published products yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Check back soon as suppliers publish new listings."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {products.length} product{products.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="public"
                  showStatus
                  company={
                    product.company
                      ? {
                          company_name: product.company.company_name,
                          company_slug: product.company.company_slug,
                        }
                      : null
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
