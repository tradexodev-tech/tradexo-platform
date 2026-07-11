import { Search } from "lucide-react";

import { PRODUCT_COUNTRIES } from "@/lib/catalog";
import type { PublicRFQFilters, PublicRFQSort } from "@/hooks/usePublicRFQs";
import { RFQ_BUDGET_TYPE_OPTIONS } from "@/types/rfq";
import type { RFQBudgetType } from "@/types/rfq";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type RFQFiltersProps = {
  search: string;
  filters: PublicRFQFilters;
  industryOptions: string[];
  industryCategoryOptions: string[];
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onIndustryCategoryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onBudgetTypeChange: (value: RFQBudgetType | "all") => void;
  onSortChange: (value: PublicRFQSort) => void;
};

export default function RFQFilters({
  search,
  filters,
  industryOptions,
  industryCategoryOptions,
  onSearchChange,
  onIndustryChange,
  onIndustryCategoryChange,
  onCountryChange,
  onBudgetTypeChange,
  onSortChange,
}: RFQFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search RFQs by title, industry, or country"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search public RFQs"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <select
          value={filters.industry}
          onChange={(event) => onIndustryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by industry"
        >
          <option value="all">All industries</option>
          {industryOptions.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <select
          value={filters.industryCategory}
          onChange={(event) => onIndustryCategoryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by industry category"
        >
          <option value="all">All categories</option>
          {industryCategoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.country}
          onChange={(event) => onCountryChange(event.target.value)}
          className={selectClass}
          aria-label="Filter by country"
        >
          <option value="all">All countries</option>
          {PRODUCT_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filters.budgetType}
          onChange={(event) =>
            onBudgetTypeChange(event.target.value as RFQBudgetType | "all")
          }
          className={selectClass}
          aria-label="Filter by budget type"
        >
          <option value="all">All budget types</option>
          {RFQ_BUDGET_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => onSortChange(event.target.value as PublicRFQSort)}
          className={selectClass}
          aria-label="Sort RFQs"
        >
          <option value="newest">Newest</option>
          <option value="required_soon">Required Soon</option>
        </select>
      </div>
    </div>
  );
}
