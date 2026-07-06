import {
  isFeaturedSupplierVerified,
  type FeaturedSupplier,
} from "@/lib/featured-suppliers";
import { supabase } from "@/lib/supabase";
import type { PublicCompanyProfile } from "@/types/company";

const SIMILAR_SUPPLIER_LIMIT = 8;
const SIMILAR_SUPPLIER_CANDIDATE_LIMIT = 60;

export type SimilarSupplier = FeaturedSupplier;

export type SimilarSuppliersInput = {
  supplierUserId: string;
  industry?: string;
  supplierType?: string;
  country?: string;
};

type SimilarSupplierTier = 1 | 2 | 3;

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

function countPublishedProductsByUser(rows: { user_id: string }[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const userId = row.user_id;
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
}

function mapProfileToSimilarSupplier(
  row: Record<string, unknown>,
  publishedProductCount: number
): SimilarSupplier | null {
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

function getSimilarSupplierTier(
  supplier: SimilarSupplier,
  input: SimilarSuppliersInput
): SimilarSupplierTier | null {
  if (supplier.id === input.supplierUserId) {
    return null;
  }

  const industry = input.industry?.trim();
  if (industry && supplier.industry.trim() === industry) {
    return 1;
  }

  const supplierType = input.supplierType?.trim();
  if (supplierType && supplier.supplier_type.trim() === supplierType) {
    return 2;
  }

  const country = input.country?.trim();
  if (country && supplier.country.trim() === country) {
    return 3;
  }

  return null;
}

export function rankSimilarSuppliers(
  suppliers: SimilarSupplier[],
  input: SimilarSuppliersInput,
  limit = SIMILAR_SUPPLIER_LIMIT
) {
  const tierBuckets: Record<SimilarSupplierTier, SimilarSupplier[]> = {
    1: [],
    2: [],
    3: [],
  };

  for (const supplier of suppliers) {
    const tier = getSimilarSupplierTier(supplier, input);
    if (tier) {
      tierBuckets[tier].push(supplier);
    }
  }

  const ranked: SimilarSupplier[] = [];

  for (const tier of [1, 2, 3] as const) {
    const sortedTier = [...tierBuckets[tier]].sort(
      (a, b) => b.published_product_count - a.published_product_count
    );

    for (const supplier of sortedTier) {
      ranked.push(supplier);
      if (ranked.length >= limit) {
        return ranked;
      }
    }
  }

  return ranked;
}

export async function fetchSimilarSuppliers(input: SimilarSuppliersInput) {
  const { data: publishedRows, error: productsError } = await supabase
    .from("products")
    .select("user_id")
    .eq("status", "published");

  if (productsError) {
    return { data: null, error: productsError };
  }

  const productCounts = countPublishedProductsByUser(publishedRows ?? []);
  const candidateIds = [...productCounts.entries()]
    .filter(([userId]) => userId !== input.supplierUserId)
    .sort((a, b) => b[1] - a[1])
    .slice(0, SIMILAR_SUPPLIER_CANDIDATE_LIMIT)
    .map(([userId]) => userId);

  if (candidateIds.length === 0) {
    return { data: [], error: null };
  }

  const profileIds = [...new Set([...candidateIds, input.supplierUserId])];

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, company_slug, company_logo, company_name, about_company, industry, business_type, year_established, number_of_employees, address, country, city, website, linkedin, certifications, export_markets, import_markets, role"
    )
    .in("id", profileIds);

  if (profilesError) {
    return { data: null, error: profilesError };
  }

  const currentProfile = (profileRows ?? []).find(
    (row) => row.id === input.supplierUserId
  ) as Record<string, unknown> | undefined;

  const resolvedInput: SimilarSuppliersInput = {
    supplierUserId: input.supplierUserId,
    industry:
      input.industry?.trim() ||
      ((currentProfile?.industry as string) ?? "").trim() ||
      undefined,
    supplierType:
      input.supplierType?.trim() ||
      ((currentProfile?.role as string) ?? "").trim() ||
      undefined,
    country:
      input.country?.trim() ||
      ((currentProfile?.country as string) ?? "").trim() ||
      undefined,
  };

  const suppliers = (profileRows ?? [])
    .filter((row) => row.id !== input.supplierUserId)
    .map((row) =>
      mapProfileToSimilarSupplier(
        row as Record<string, unknown>,
        productCounts.get(row.id as string) ?? 0
      )
    )
    .filter((supplier): supplier is SimilarSupplier => supplier !== null);

  return {
    data: rankSimilarSuppliers(suppliers, resolvedInput),
    error: null,
  };
}
