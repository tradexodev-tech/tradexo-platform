"use client";

import { Suspense } from "react";

import MarketplaceFiltersBar from "@/components/marketplace/MarketplaceFiltersBar";
import MarketplaceProductCard from "@/components/marketplace/MarketplaceProductCard";
import MarketplaceProductGridSkeleton from "@/components/marketplace/MarketplaceProductGridSkeleton";
import { Button } from "@/components/ui/button";
import { useMarketplaceFilters } from "@/hooks/useMarketplaceFilters";
import type { MarketplaceProduct } from "@/lib/product-public";

type MarketplaceResultsProps = {
  products: MarketplaceProduct[];
  errorMessage?: string | null;
};

function MarketplaceResultsContent({
  products,
  errorMessage,
}: MarketplaceResultsProps) {
  const {
    filters,
    searchInput,
    setSearchInput,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    isPending,
  } = useMarketplaceFilters();

  return (
    <>
      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <MarketplaceFiltersBar
        filters={filters}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onCategoryChange={(category) =>
          applyFilters({ category: category || undefined })
        }
        onCountryChange={(country) =>
          applyFilters({ country: country || undefined })
        }
        onIndustryChange={(industry) =>
          applyFilters({ industry: industry || undefined })
        }
        onSupplierTypeChange={(supplierType) =>
          applyFilters({ supplierType: supplierType || undefined })
        }
        onSortChange={(sort) => applyFilters({ sort })}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
      />

      {isPending ? (
        <div className="mt-6">
          <MarketplaceProductGridSkeleton />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">
            {hasActiveFilters ? "No products found" : "No published products yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Check back soon as suppliers publish new listings."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <MarketplaceProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function MarketplaceResults(props: MarketplaceResultsProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 border-b pb-6">
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      }
    >
      <MarketplaceResultsContent {...props} />
    </Suspense>
  );
}
