"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { MarketplaceSort } from "@/lib/catalog";
import {
  buildMarketplaceQueryString,
  marketplaceFiltersAreActive,
  parseMarketplaceFilters,
  type MarketplaceFilters,
} from "@/lib/product-public";

const SEARCH_DEBOUNCE_MS = 400;

export function useMarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);

  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return parseMarketplaceFilters(params);
  }, [searchParams]);

  const searchInput = pendingSearch ?? filters.search ?? "";

  const hasActiveFilters = useMemo(
    () => marketplaceFiltersAreActive(filters),
    [filters]
  );

  const navigateWithFilters = useCallback(
    (next: MarketplaceFilters & { sort?: MarketplaceSort }) => {
      startTransition(() => {
        router.push(`${pathname}${buildMarketplaceQueryString(next)}`);
      });
    },
    [pathname, router]
  );

  const applyFilters = useCallback(
    (patch: Partial<MarketplaceFilters & { sort: MarketplaceSort }>) => {
      navigateWithFilters({ ...filters, ...patch });
    },
    [filters, navigateWithFilters]
  );

  const clearFilters = useCallback(() => {
    setPendingSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  }, [pathname, router]);

  const setSearchInput = useCallback((value: string) => {
    setPendingSearch(value);
  }, []);

  useEffect(() => {
    if (pendingSearch === null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const trimmed = pendingSearch.trim();
      const current = searchParams.get("q")?.trim() ?? "";
      if (trimmed === current) {
        setPendingSearch(null);
        return;
      }

      const currentFilters = parseMarketplaceFilters(
        Object.fromEntries(searchParams.entries())
      );

      navigateWithFilters({
        ...currentFilters,
        search: trimmed || undefined,
      });
      setPendingSearch(null);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [pendingSearch, searchParams, navigateWithFilters]);

  return {
    filters,
    searchInput,
    setSearchInput,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    isPending,
  };
}
