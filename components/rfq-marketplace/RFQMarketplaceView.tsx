"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import RFQCard from "@/components/rfq-marketplace/RFQCard";
import RFQEmptyState from "@/components/rfq-marketplace/RFQEmptyState";
import RFQFilters from "@/components/rfq-marketplace/RFQFilters";
import RFQSkeleton from "@/components/rfq-marketplace/RFQSkeleton";
import { Button } from "@/components/ui/button";
import { usePublicRFQs } from "@/hooks/usePublicRFQs";
import { COMPANY_INDUSTRIES, PRODUCT_CATEGORIES } from "@/lib/catalog";

export default function RFQMarketplaceView() {
  const {
    items,
    allRfqs,
    totalCount,
    totalPages,
    filters,
    loading,
    loadError,
    searchInput,
    hasActiveFilters,
    setSearchInput,
    setFilters,
    clearFilters,
  } = usePublicRFQs();

  const industryOptions = useMemo(() => {
    const fromData = allRfqs
      .map((rfq) => rfq.industry?.trim())
      .filter((value): value is string => Boolean(value));

    return [...new Set([...COMPANY_INDUSTRIES, ...fromData])].sort();
  }, [allRfqs]);

  const industryCategoryOptions = useMemo(() => {
    const fromData = allRfqs
      .map((rfq) => rfq.industry_category?.trim())
      .filter((value): value is string => Boolean(value));

    return [...new Set([...PRODUCT_CATEGORIES, ...fromData])].sort();
  }, [allRfqs]);

  const showEmptyCatalog =
    !loading && totalCount === 0 && !hasActiveFilters && !loadError;
  const showNoResults =
    !loading && totalCount === 0 && hasActiveFilters && !loadError;
  const pageStart =
    totalCount === 0 ? 0 : (filters.page - 1) * 12 + 1;
  const pageEnd = Math.min(filters.page * 12, totalCount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">RFQ Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Discover open buyer requests for quotation from global importers.
        </p>
      </div>

      {loadError ? (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      {!showEmptyCatalog ? (
        <RFQFilters
          search={searchInput}
          filters={filters}
          industryOptions={industryOptions}
          industryCategoryOptions={industryCategoryOptions}
          onSearchChange={setSearchInput}
          onIndustryChange={(industry) => setFilters({ industry })}
          onIndustryCategoryChange={(industryCategory) =>
            setFilters({ industryCategory })
          }
          onCountryChange={(country) => setFilters({ country })}
          onBudgetTypeChange={(budgetType) => setFilters({ budgetType })}
          onSortChange={(sort) => setFilters({ sort })}
        />
      ) : null}

      <div className="mt-6">
        {loading ? (
          <RFQSkeleton />
        ) : showEmptyCatalog ? (
          <RFQEmptyState />
        ) : showNoResults ? (
          <RFQEmptyState onClearFilters={clearFilters} showClearFilters />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {totalCount} public RFQ{totalCount === 1 ? "" : "s"} found
            </p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <RFQCard key={item.rfq.id} item={item} />
              ))}
            </div>

            {totalCount > 0 ? (
              <div className="mt-8 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {pageStart}–{pageEnd} of {totalCount}
                </p>
                <nav
                  className="flex items-center gap-2"
                  aria-label="RFQ marketplace pagination"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({ page: filters.page - 1 })}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {filters.page} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters({ page: filters.page + 1 })}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </nav>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
