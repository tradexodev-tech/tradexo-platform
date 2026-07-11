import { calculateAIMatch } from "@/lib/ai-match";
import {
  isFeaturedSupplierVerified,
  type FeaturedSupplier,
} from "@/lib/featured-suppliers";
import {
  marketplaceFiltersAreActive,
  type MarketplaceFilters,
} from "@/lib/product-public";
import { supabase } from "@/lib/supabase";
import type {
  AIMatchBuyerProfile,
  AIMatchResult,
  AIMatchSupplierProduct,
  AIMatchSupplierProfile,
} from "@/types/ai-match";
import type { PublicCompanyProfile } from "@/types/company";

export const RECOMMENDED_SUPPLIER_LIMIT = 8;

export const SUGGESTED_SUPPLIER_REASONS = [
  "✓ Popular supplier",
  "✓ Verified company",
  "✓ Active marketplace listings",
] as const;

export type RecommendedSupplierMatch = AIMatchResult & {
  kind: "match";
};

export type RecommendedSupplierSuggested = {
  kind: "suggested";
  confidence: "Suggested";
  reasons: string[];
};

export type RecommendedSupplier = FeaturedSupplier & {
  recommendation: RecommendedSupplierMatch | RecommendedSupplierSuggested;
};

export type RecommendedSuppliersBuyerContext = {
  userId?: string;
  industry?: string;
  country?: string;
  interestedCategories?: string[];
  supplierPreference?: string;
  searchKeywords?: string[];
  hasAuthenticatedProfile?: boolean;
};
function parseListField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapProfileForCompletion(
  row: Record<string, unknown>
): PublicCompanyProfile {
  return {
    id: row.id as string,
    company_slug: (row.company_slug as string) ?? "",
    company_logo: (row.company_logo as string | null) ?? null,
    company_name: (row.company_name as string) ?? "",
    about_company: (row.about_company as string) ?? "",
    industry: (row.industry as string) ?? "",
    business_type: (row.business_type as string) ?? "",
    year_established:
      row.year_established != null ? Number(row.year_established) : null,
    number_of_employees: (row.number_of_employees as string) ?? "",
    address: (row.address as string) ?? "",
    country: (row.country as string) ?? "",
    city: (row.city as string) ?? "",
    website: (row.website as string) ?? "",
    linkedin: (row.linkedin as string) ?? "",
    certifications: parseListField(row.certifications),
    export_markets: parseListField(row.export_markets),
    import_markets: parseListField(row.import_markets),
  };
}

function expandSearchKeywords(keywords: string[]) {
  return keywords
    .flatMap((keyword) => keyword.split(/[,\s]+/))
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function buildRecommendedSuppliersBuyerProfile(
  context: RecommendedSuppliersBuyerContext
): AIMatchBuyerProfile {
  return {
    industry: context.industry?.trim() ?? "",
    country: context.country?.trim() ?? "",
    interestedCategories: (context.interestedCategories ?? [])
      .map((category) => category.trim())
      .filter(Boolean),
    supplierPreference: context.supplierPreference?.trim() ?? "",
    searchKeywords: expandSearchKeywords(context.searchKeywords ?? []),
  };
}

export function buildRecommendedSuppliersBuyerContext(
  profile: Record<string, unknown> | null | undefined,
  filters: MarketplaceFilters = {}
): RecommendedSuppliersBuyerContext {
  const hasAuthenticatedProfile = Boolean(profile?.id);

  if (hasAuthenticatedProfile) {
    return {
      userId: typeof profile?.id === "string" ? profile.id : undefined,
      hasAuthenticatedProfile: true,
      industry:
        (typeof profile?.industry === "string" ? profile.industry : "") ||
        filters.industry ||
        "",
      country:
        (typeof profile?.country === "string" ? profile.country : "") ||
        filters.country ||
        "",
      interestedCategories: filters.category?.trim()
        ? [filters.category.trim()]
        : [],
      supplierPreference: filters.supplierType?.trim() ?? "",
      searchKeywords: filters.search?.trim() ? [filters.search.trim()] : [],
    };
  }

  return {
    hasAuthenticatedProfile: false,
    industry: filters.industry?.trim() ?? "",
    country: filters.country?.trim() ?? "",
    interestedCategories: filters.category?.trim()
      ? [filters.category.trim()]
      : [],
    supplierPreference: filters.supplierType?.trim() ?? "",
    searchKeywords: filters.search?.trim() ? [filters.search.trim()] : [],
  };
}

export function recommendedSuppliersBuyerContextHasSignals(
  context: RecommendedSuppliersBuyerContext
) {
  const buyer = buildRecommendedSuppliersBuyerProfile(context);

  return Boolean(
    buyer.industry ||
      buyer.country ||
      buyer.interestedCategories.length > 0 ||
      buyer.supplierPreference ||
      buyer.searchKeywords.length > 0
  );
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

function mapSupplierMatchProfile(
  row: Record<string, unknown>,
  products: AIMatchSupplierProduct[]
): AIMatchSupplierProfile {
  const productCategories = [
    ...new Set(
      products
        .map((product) => product.product_category.trim())
        .filter(Boolean)
    ),
  ];

  return {
    industry: (row.industry as string) ?? "",
    country: (row.country as string) ?? "",
    supplierType: ((row.role as string) ?? "").trim() || "Supplier",
    companyProfile: {
      company_name: (row.company_name as string) ?? "",
      about_company: (row.about_company as string) ?? "",
      business_type: (row.business_type as string) ?? "",
    },
    publishedProducts: products,
    productCategories,
  };
}

function mapProfileToFeaturedSupplier(
  row: Record<string, unknown>,
  publishedProductCount: number
): FeaturedSupplier | null {
  const companyName = ((row.company_name as string) ?? "").trim();
  const companySlug = ((row.company_slug as string) ?? "").trim();

  if (!companyName || !companySlug || publishedProductCount === 0) {
    return null;
  }

  const profile = mapProfileForCompletion(row);

  return {
    id: row.id as string,
    company_slug: companySlug,
    company_logo: (row.company_logo as string | null) ?? null,
    company_name: companyName,
    about_company: (row.about_company as string) ?? "",
    industry: (row.industry as string) ?? "",
    country: (row.country as string) ?? "",
    supplier_type: ((row.role as string) ?? "").trim() || "Supplier",
    published_product_count: publishedProductCount,
    is_verified: isFeaturedSupplierVerified(profile),
  };
}

export function rankRecommendedSuppliers(
  buyer: AIMatchBuyerProfile,
  candidates: Array<{
    supplier: FeaturedSupplier;
    matchProfile: AIMatchSupplierProfile;
  }>,
  limit = RECOMMENDED_SUPPLIER_LIMIT
): RecommendedSupplier[] {
  return candidates
    .map(({ supplier, matchProfile }) => ({
      ...supplier,
      recommendation: {
        kind: "match" as const,
        ...calculateAIMatch(buyer, matchProfile),
      },
    }))
    .filter(
      (item): item is RecommendedSupplier & { recommendation: RecommendedSupplierMatch } =>
        item.recommendation.kind === "match" && item.recommendation.score > 0
    )
    .sort((left, right) => right.recommendation.score - left.recommendation.score)
    .slice(0, limit);
}

function rankSuggestedRecommendedSuppliers(
  suppliers: FeaturedSupplier[],
  latestActivityByUser: Map<string, string>,
  limit = RECOMMENDED_SUPPLIER_LIMIT
): RecommendedSupplier[] {
  return [...suppliers]
    .sort((left, right) => {
      if (left.is_verified !== right.is_verified) {
        return left.is_verified ? -1 : 1;
      }

      if (left.published_product_count !== right.published_product_count) {
        return right.published_product_count - left.published_product_count;
      }

      const leftActivity = new Date(
        latestActivityByUser.get(left.id) ?? 0
      ).getTime();
      const rightActivity = new Date(
        latestActivityByUser.get(right.id) ?? 0
      ).getTime();

      return rightActivity - leftActivity;
    })
    .slice(0, limit)
    .map((supplier) => ({
      ...supplier,
      recommendation: {
        kind: "suggested" as const,
        confidence: "Suggested" as const,
        reasons: [...SUGGESTED_SUPPLIER_REASONS],
      },
    }));
}
const RECOMMENDED_MATCH_REASON_PATTERNS: Array<{
  test: (reason: string) => boolean;
  label: string;
}> = [
  {
    test: (reason) => /same industry/i.test(reason),
    label: "✓ Same Industry",
  },
  {
    test: (reason) => /product categor/i.test(reason),
    label: "✓ Same Category",
  },
  {
    test: (reason) => /preferred country/i.test(reason),
    label: "✓ Preferred Country",
  },
  {
    test: (reason) => /matching keywords/i.test(reason),
    label: "✓ Matching Keywords",
  },
];

export function formatRecommendedMatchReasons(
  reasons: string[],
  limit = 3
) {  const formatted: string[] = [];

  for (const pattern of RECOMMENDED_MATCH_REASON_PATTERNS) {
    if (reasons.some(pattern.test)) {
      formatted.push(pattern.label);
    }

    if (formatted.length >= limit) {
      break;
    }
  }

  return formatted;
}

export function getRecommendedMatchConfidenceClassName(
  confidence: RecommendedSupplierMatch["confidence"] | "Suggested"
) {
  switch (confidence) {
    case "High":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "Medium":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Suggested":
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
    case "Low":
    default:
      return "bg-slate-100 text-slate-700 ring-slate-600/20";
  }
}

export function isSuggestedRecommendedSupplier(
  supplier: RecommendedSupplier
): supplier is RecommendedSupplier & {
  recommendation: RecommendedSupplierSuggested;
} {
  return supplier.recommendation.kind === "suggested";
}
export async function fetchRecommendedSuppliers(
  context: RecommendedSuppliersBuyerContext,
  filters: MarketplaceFilters = {},
  limit = RECOMMENDED_SUPPLIER_LIMIT
) {
  const buyer = buildRecommendedSuppliersBuyerProfile(context);
  const hasBuyerSignals = recommendedSuppliersBuyerContextHasSignals(context);
  const hasActiveFilters = marketplaceFiltersAreActive(filters);

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select(
      "user_id, product_name, product_category, short_description, full_description, meta_keywords, updated_at"
    )
    .eq("status", "published");
  if (productsError) {
    return { data: null, error: productsError };
  }

  if (!productRows?.length) {
    return { data: [], error: null };
  }

  const productsByUser = new Map<string, AIMatchSupplierProduct[]>();
  const latestActivityByUser = new Map<string, string>();

  for (const row of productRows) {
    const userId = row.user_id as string;

    if (context.userId && userId === context.userId) {
      continue;
    }

    const products = productsByUser.get(userId) ?? [];
    products.push(mapProductRowForMatch(row as Record<string, unknown>));
    productsByUser.set(userId, products);

    const updatedAt = (row.updated_at as string) ?? "";
    const previousActivity = latestActivityByUser.get(userId);

    if (
      updatedAt &&
      (!previousActivity || updatedAt > previousActivity)
    ) {
      latestActivityByUser.set(userId, updatedAt);
    }
  }
  const supplierUserIds = [...productsByUser.keys()];

  if (supplierUserIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, company_slug, company_logo, company_name, about_company, industry, business_type, year_established, number_of_employees, address, country, city, website, linkedin, certifications, export_markets, import_markets, role"
    )
    .in("id", supplierUserIds);

  if (profilesError) {
    return { data: null, error: profilesError };
  }

  const candidates: Array<{
    supplier: FeaturedSupplier;
    matchProfile: AIMatchSupplierProfile;
  }> = [];

  for (const row of profileRows ?? []) {
    const userId = row.id as string;
    const products = productsByUser.get(userId) ?? [];
    const supplier = mapProfileToFeaturedSupplier(
      row as Record<string, unknown>,
      products.length
    );

    if (!supplier) {
      continue;
    }

    candidates.push({
      supplier,
      matchProfile: mapSupplierMatchProfile(
        row as Record<string, unknown>,
        products
      ),
    });
  }

  const featuredSuppliers = candidates.map(({ supplier }) => supplier);

  if (hasBuyerSignals) {
    const matched = rankRecommendedSuppliers(buyer, candidates, limit);

    if (matched.length > 0) {
      return {
        data: matched,
        error: null,
      };
    }
  }

  if (!hasBuyerSignals && !hasActiveFilters) {
    return {
      data: rankSuggestedRecommendedSuppliers(
        featuredSuppliers,
        latestActivityByUser,
        limit
      ),
      error: null,
    };
  }

  return {
    data: [],
    error: null,
  };
}