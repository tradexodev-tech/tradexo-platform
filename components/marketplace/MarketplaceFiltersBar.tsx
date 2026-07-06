import {
  COMPANY_INDUSTRIES,
  MARKETPLACE_SORT_OPTIONS,
  MARKETPLACE_SUPPLIER_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNTRIES,
  type MarketplaceSort,
} from "@/lib/catalog";
import type { ResolvedMarketplaceFilters } from "@/lib/product-public";
import { Search } from "lucide-react";

const selectClass =
  "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type MarketplaceFiltersBarProps = {
  filters: ResolvedMarketplaceFilters;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onSupplierTypeChange: (value: string) => void;
  onSortChange: (value: MarketplaceSort) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isPending?: boolean;
};

export default function MarketplaceFiltersBar({
  filters,
  searchInput,
  onSearchChange,
  onCategoryChange,
  onCountryChange,
  onIndustryChange,
  onSupplierTypeChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  isPending = false,
}: MarketplaceFiltersBarProps) {
  return (
    <div
      className={`space-y-3 border-b pb-6 ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search product name, supplier, or description"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search marketplace products"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <select
          value={filters.category ?? ""}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.country ?? ""}
          onChange={(event) => onCountryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by country"
        >
          <option value="">All Countries</option>
          {PRODUCT_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filters.industry ?? ""}
          onChange={(event) => onIndustryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by industry"
        >
          <option value="">All Industries</option>
          {COMPANY_INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <select
          value={filters.supplierType ?? ""}
          onChange={(event) => onSupplierTypeChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by supplier type"
        >
          <option value="">All Supplier Types</option>
          {MARKETPLACE_SUPPLIER_TYPES.map((supplierType) => (
            <option key={supplierType} value={supplierType}>
              {supplierType}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) =>
            onSortChange(event.target.value as MarketplaceSort)
          }
          className={selectClass}
          aria-label="Sort products"
        >
          {MARKETPLACE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
