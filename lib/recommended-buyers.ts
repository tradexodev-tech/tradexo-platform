import { calculateAIMatch } from "@/lib/ai-match";
import { supabase } from "@/lib/supabase";
import type {
  AIMatchBuyerProfile,
  AIMatchResult,
  AIMatchSupplierProduct,
  AIMatchSupplierProfile,
} from "@/types/ai-match";

export const RECOMMENDED_BUYER_LIMIT = 10;

export const BUYER_IMPORTER_ROLE = "Importer";

export type RecommendedBuyer = {
  id: string;
  full_name: string;
  company_name: string;
  country: string;
  industry: string;
  match: AIMatchResult;
};

export type RecommendedBuyersFetchResult = {
  buyers: RecommendedBuyer[];
  publishedProducts: AIMatchSupplierProduct[];
  supplierMatchProfile: AIMatchSupplierProfile;
};

export type RecommendedBuyersSupplierProfile = {
  id: string;
  industry?: string | null;
  country?: string | null;
  role?: string | null;
  company_name?: string | null;
  about_company?: string | null;
  business_type?: string | null;
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

function expandSearchKeywords(values: string[]) {
  return values
    .flatMap((value) => value.split(/[,\s]+/))
    .map((value) => value.trim())
    .filter(Boolean);
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

export function buildRecommendedBuyerProfile(
  row: Record<string, unknown>
): AIMatchBuyerProfile {
  const importMarkets = parseListField(row.import_markets);

  return {
    industry: ((row.industry as string) ?? "").trim(),
    country: ((row.country as string) ?? "").trim(),
    interestedCategories: [],
    supplierPreference: "",
    searchKeywords: expandSearchKeywords([
      (row.about_company as string) ?? "",
      ...importMarkets,
    ]),
  };
}

export function buildRecommendedBuyersSupplierProfile(
  supplierProfile: RecommendedBuyersSupplierProfile,
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
    industry: (supplierProfile.industry ?? "").trim(),
    country: (supplierProfile.country ?? "").trim(),
    supplierType: (supplierProfile.role ?? "").trim() || "Supplier",
    companyProfile: {
      company_name: (supplierProfile.company_name ?? "").trim(),
      about_company: (supplierProfile.about_company ?? "").trim(),
      business_type: (supplierProfile.business_type ?? "").trim(),
    },
    publishedProducts: products,
    productCategories,
  };
}

function mapImporterToRecommendedBuyer(
  row: Record<string, unknown>,
  match: AIMatchResult
): RecommendedBuyer {
  return {
    id: row.id as string,
    full_name: ((row.full_name as string) ?? "").trim() || "Buyer",
    company_name: ((row.company_name as string) ?? "").trim() || "—",
    country: ((row.country as string) ?? "").trim() || "—",
    industry: ((row.industry as string) ?? "").trim() || "—",
    match,
  };
}

export function rankRecommendedBuyers(
  supplierMatchProfile: AIMatchSupplierProfile,
  importerRows: Record<string, unknown>[],
  limit = RECOMMENDED_BUYER_LIMIT
): RecommendedBuyer[] {
  return importerRows
    .map((row) => {
      const buyerProfile = buildRecommendedBuyerProfile(row);
      const match = calculateAIMatch(buyerProfile, supplierMatchProfile);

      return mapImporterToRecommendedBuyer(row, match);
    })
    .filter((buyer) => buyer.match.score > 0)
    .sort((left, right) => right.match.score - left.match.score)
    .slice(0, limit);
}

export function isSupplierRole(role: string | null | undefined) {
  const normalized = role?.trim();

  return Boolean(normalized && normalized !== BUYER_IMPORTER_ROLE);
}

export async function fetchRecommendedBuyers(
  supplierProfile: RecommendedBuyersSupplierProfile,
  limit = RECOMMENDED_BUYER_LIMIT
) {
  const { data: importerRows, error: importersError } = await supabase
    .from("profiles")
    .select(
      "id, full_name, company_name, industry, country, role, about_company, business_type, import_markets"
    )
    .eq("role", BUYER_IMPORTER_ROLE)
    .neq("id", supplierProfile.id);

  if (importersError) {
    return { data: null, error: importersError };
  }

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select(
      "product_name, product_category, short_description, full_description, meta_keywords"
    )
    .eq("user_id", supplierProfile.id)
    .eq("status", "published");

  if (productsError) {
    return { data: null, error: productsError };
  }

  const publishedProducts = (productRows ?? []).map((row) =>
    mapProductRowForMatch(row as Record<string, unknown>)
  );

  const supplierMatchProfile = buildRecommendedBuyersSupplierProfile(
    supplierProfile,
    publishedProducts
  );

  return {
    data: {
      buyers: rankRecommendedBuyers(
        supplierMatchProfile,
        (importerRows ?? []) as Record<string, unknown>[],
        limit
      ),
      publishedProducts,
      supplierMatchProfile,
    },
    error: null,
  };
}
