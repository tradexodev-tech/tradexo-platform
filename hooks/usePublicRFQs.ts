"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { calculateAIMatch } from "@/lib/ai-match";
import { formatAIMatchExplanationReasons } from "@/lib/ai-match-explainer";
import { getProfile, getUser } from "@/lib/auth";
import { fetchPublicRFQs } from "@/lib/rfq";
import {
  buildRecommendedBuyersSupplierProfile,
  isSupplierRole,
  type RecommendedBuyersSupplierProfile,
} from "@/lib/recommended-buyers";
import { getRecommendedMatchConfidenceClassName } from "@/lib/recommended-suppliers";
import { supabase } from "@/lib/supabase";
import type { AIDashboardSuggestionInput } from "@/lib/ai-dashboard";
import type {
  AIMatchBuyerProfile,
  AIMatchResult,
  AIMatchSupplierProduct,
  AIMatchSupplierProfile,
} from "@/types/ai-match";
import type { PublicCompanyProfile } from "@/types/company";
import type { RFQ, RFQBudgetType } from "@/types/rfq";

function mapProfileToCompanyProfile(
  profile: Record<string, unknown>
): PublicCompanyProfile {
  return {
    id: profile.id as string,
    company_slug: (profile.company_slug as string) ?? "",
    company_logo: (profile.company_logo as string | null) ?? null,
    company_name: (profile.company_name as string) ?? "",
    about_company: (profile.about_company as string) ?? "",
    industry: (profile.industry as string) ?? "",
    business_type: (profile.business_type as string) ?? "",
    year_established:
      profile.year_established != null
        ? Number(profile.year_established)
        : null,
    number_of_employees: (profile.number_of_employees as string) ?? "",
    address: (profile.address as string) ?? "",
    country: (profile.country as string) ?? "",
    city: (profile.city as string) ?? "",
    website: (profile.website as string) ?? "",
    linkedin: (profile.linkedin as string) ?? "",
    certifications: Array.isArray(profile.certifications)
      ? profile.certifications.filter((item): item is string => typeof item === "string")
      : [],
    export_markets: Array.isArray(profile.export_markets)
      ? profile.export_markets.filter((item): item is string => typeof item === "string")
      : [],
    import_markets: Array.isArray(profile.import_markets)
      ? profile.import_markets.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export const PUBLIC_RFQ_PAGE_SIZE = 12;

export const PUBLIC_RFQ_FETCH_LIMIT = 500;

export type PublicRFQSort = "newest" | "required_soon";

export type PublicRFQFilters = {
  search: string;
  industry: string;
  industryCategory: string;
  country: string;
  budgetType: RFQBudgetType | "all";
  sort: PublicRFQSort;
  page: number;
};

export const DEFAULT_PUBLIC_RFQ_FILTERS: PublicRFQFilters = {
  search: "",
  industry: "all",
  industryCategory: "all",
  country: "all",
  budgetType: "all",
  sort: "newest",
  page: 1,
};

export type PublicRFQListItem = {
  rfq: RFQ;
  match?: AIMatchResult;
};

export type SupplierRFQMatchContext = {
  supplierProfile: RecommendedBuyersSupplierProfile;
  supplierMatchProfile: AIMatchSupplierProfile;
  supplierImprovement: AIDashboardSuggestionInput;
};

function expandSearchKeywords(values: string[]) {
  return values
    .flatMap((value) => value.split(/[,\s]+/))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildRFQBuyerProfile(rfq: RFQ): AIMatchBuyerProfile {
  const industryCategory = rfq.industry_category?.trim();

  return {
    industry: rfq.industry?.trim() ?? "",
    country: rfq.delivery_country.trim(),
    interestedCategories: industryCategory ? [industryCategory] : [],
    supplierPreference: "",
    searchKeywords: expandSearchKeywords([rfq.title, rfq.description]),
  };
}

function mapProductRowForMatch(
  row: Record<string, unknown>
): AIMatchSupplierProduct {
  return {
    product_name: (row.product_name as string) ?? "",
    product_category: (row.product_category as string) ?? "",
    short_description: (row.short_description as string) ?? "",
    full_description: (row.full_description as string) ?? "",
    meta_keywords: (row.meta_keywords as string) ?? "",
  };
}

export function computeRFQMatch(
  rfq: RFQ,
  supplierMatchProfile: AIMatchSupplierProfile
): AIMatchResult {
  return calculateAIMatch(buildRFQBuyerProfile(rfq), supplierMatchProfile);
}

export function getPublicRFQMatchReasons(match: AIMatchResult, limit = 3) {
  return formatAIMatchExplanationReasons(match.reasons, limit);
}

function matchesPublicRFQSearch(rfq: RFQ, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    rfq.title.toLowerCase().includes(query) ||
    rfq.description.toLowerCase().includes(query) ||
    (rfq.industry?.toLowerCase().includes(query) ?? false) ||
    (rfq.industry_category?.toLowerCase().includes(query) ?? false) ||
    rfq.delivery_country.toLowerCase().includes(query)
  );
}

function applyPublicRFQFilters(rfqs: RFQ[], filters: PublicRFQFilters) {
  return rfqs.filter((rfq) => {
    if (!matchesPublicRFQSearch(rfq, filters.search)) {
      return false;
    }

    if (filters.industry !== "all" && rfq.industry !== filters.industry) {
      return false;
    }

    if (
      filters.industryCategory !== "all" &&
      rfq.industry_category !== filters.industryCategory
    ) {
      return false;
    }

    if (
      filters.country !== "all" &&
      rfq.delivery_country !== filters.country
    ) {
      return false;
    }

    if (
      filters.budgetType !== "all" &&
      rfq.budget_type !== filters.budgetType
    ) {
      return false;
    }

    return true;
  });
}

function sortPublicRFQs(rfqs: RFQ[], sort: PublicRFQSort) {
  const sorted = [...rfqs];

  if (sort === "required_soon") {
    sorted.sort((left, right) => {
      if (!left.required_before && !right.required_before) {
        return (
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
        );
      }

      if (!left.required_before) {
        return 1;
      }

      if (!right.required_before) {
        return -1;
      }

      return (
        new Date(left.required_before).getTime() -
        new Date(right.required_before).getTime()
      );
    });

    return sorted;
  }

  sorted.sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime()
  );

  return sorted;
}

export function publicRFQFiltersAreActive(filters: PublicRFQFilters) {
  return (
    filters.search.trim().length > 0 ||
    filters.industry !== "all" ||
    filters.industryCategory !== "all" ||
    filters.country !== "all" ||
    filters.budgetType !== "all" ||
    filters.sort !== "newest"
  );
}

export function getPublicRFQMatchConfidenceClassName(confidence: AIMatchResult["confidence"]) {
  return getRecommendedMatchConfidenceClassName(confidence);
}

export async function fetchSupplierRFQMatchContext(): Promise<SupplierRFQMatchContext | null> {
  const { data: authData } = await getUser();

  if (!authData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await getProfile();

  if (profileError || !profile || !isSupplierRole(profile.role)) {
    return null;
  }

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select(
      "product_name, product_category, short_description, full_description, meta_keywords"
    )
    .eq("user_id", profile.id)
    .eq("status", "published");

  if (productsError) {
    return null;
  }

  const publishedProducts = (productRows ?? []).map((row) =>
    mapProductRowForMatch(row as Record<string, unknown>)
  );

  const supplierProfile: RecommendedBuyersSupplierProfile = {
    id: profile.id as string,
    industry: profile.industry as string | null | undefined,
    country: profile.country as string | null | undefined,
    role: profile.role as string | null | undefined,
    company_name: profile.company_name as string | null | undefined,
    about_company: profile.about_company as string | null | undefined,
    business_type: profile.business_type as string | null | undefined,
  };

  const supplierMatchProfile = buildRecommendedBuyersSupplierProfile(
    supplierProfile,
    publishedProducts
  );

  return {
    supplierProfile,
    supplierMatchProfile,
    supplierImprovement: {
      companyProfile: mapProfileToCompanyProfile(
        profile as Record<string, unknown>
      ),
      publishedProducts,
      supplierMatchProfile,
    },
  };
}

export function usePublicRFQs(initialFilters?: Partial<PublicRFQFilters>) {
  const [allRfqs, setAllRfqs] = useState<RFQ[]>([]);
  const [filters, setFiltersState] = useState<PublicRFQFilters>({
    ...DEFAULT_PUBLIC_RFQ_FILTERS,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [supplierContext, setSupplierContext] =
    useState<SupplierRFQMatchContext | null>(null);
  const [searchInput, setSearchInput] = useState(
    () => initialFilters?.search ?? ""
  );
  const appliedSearchRef = useRef(searchInput);

  const filteredRfqs = useMemo(() => {
    const filtered = applyPublicRFQFilters(allRfqs, filters);
    return sortPublicRFQs(filtered, filters.sort);
  }, [allRfqs, filters]);

  const totalCount = filteredRfqs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PUBLIC_RFQ_PAGE_SIZE));

  const paginatedItems = useMemo<PublicRFQListItem[]>(() => {
    const from = (filters.page - 1) * PUBLIC_RFQ_PAGE_SIZE;
    const to = from + PUBLIC_RFQ_PAGE_SIZE;

    return filteredRfqs.slice(from, to).map((rfq) => ({
      rfq,
      match: supplierContext
        ? computeRFQMatch(rfq, supplierContext.supplierMatchProfile)
        : undefined,
    }));
  }, [filteredRfqs, filters.page, supplierContext]);

  const setFilters = useCallback((partial: Partial<PublicRFQFilters>) => {
    setFiltersState((previous) => ({
      ...previous,
      ...partial,
      page:
        partial.page ??
        (partial.search !== undefined ||
        partial.industry !== undefined ||
        partial.industryCategory !== undefined ||
        partial.country !== undefined ||
        partial.budgetType !== undefined ||
        partial.sort !== undefined
          ? 1
          : previous.page),
    }));
  }, []);

  useEffect(() => {
    appliedSearchRef.current = filters.search;
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== appliedSearchRef.current) {
        setFilters({ search: searchInput });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setFilters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const [rfqsResult, matchContext] = await Promise.all([
        fetchPublicRFQs({
          page: 1,
          pageSize: PUBLIC_RFQ_FETCH_LIMIT,
        }),
        fetchSupplierRFQMatchContext(),
      ]);

      if (cancelled) {
        return;
      }

      if (rfqsResult.error) {
        setLoadError(rfqsResult.error.message);
        setAllRfqs([]);
      } else {
        setAllRfqs(rfqsResult.data ?? []);
      }

      setSupplierContext(matchContext);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setFiltersState(DEFAULT_PUBLIC_RFQ_FILTERS);
  }, []);

  return {
    items: paginatedItems,
    allRfqs,
    totalCount,
    totalPages,
    filters,
    loading,
    loadError,
    supplierContext,
    searchInput,
    hasActiveFilters: publicRFQFiltersAreActive(filters),
    setSearchInput,
    setFilters,
    clearFilters,
    fetchSupplierMatchContext: fetchSupplierRFQMatchContext,
    buildRFQBuyerProfile,
    computeRFQMatch,
  };
}
