"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import {
  COMPANY_INDUSTRIES,
  MARKETPLACE_SORT_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNTRIES,
  type MarketplaceSort,
} from "@/lib/catalog";
import type { MarketplaceFilters } from "@/lib/product-public";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type MarketplaceFiltersBarProps = {
  filters: Required<Pick<MarketplaceFilters, "sort">> &
    MarketplaceFilters;
};

function buildQueryString(filters: MarketplaceFilters) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("q", filters.search.trim());
  }
  if (filters.category?.trim()) {
    params.set("category", filters.category.trim());
  }
  if (filters.country?.trim()) {
    params.set("country", filters.country.trim());
  }
  if (filters.industry?.trim()) {
    params.set("industry", filters.industry.trim());
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function MarketplaceFiltersBar({
  filters,
}: MarketplaceFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    setSearch(filters.search ?? "");
  }, [filters.search]);

  function applyFilters(next: MarketplaceFilters) {
    startTransition(() => {
      router.push(`${pathname}${buildQueryString(next)}`);
    });
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = search.trim();
      const current = searchParams.get("q")?.trim() ?? "";
      if (trimmed === current) return;

      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const query = params.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname);
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  return (
    <div
      className={`space-y-3 border-b pb-6 ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search marketplace products"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.category ?? ""}
          onChange={(event) =>
            applyFilters({
              ...filters,
              category: event.target.value || undefined,
            })
          }
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
          onChange={(event) =>
            applyFilters({
              ...filters,
              country: event.target.value || undefined,
            })
          }
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
          onChange={(event) =>
            applyFilters({
              ...filters,
              industry: event.target.value || undefined,
            })
          }
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
          value={filters.sort}
          onChange={(event) =>
            applyFilters({
              ...filters,
              sort: event.target.value as MarketplaceSort,
            })
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
    </div>
  );
}
