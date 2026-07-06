import { calculateCompanyProfileCompletion } from "@/lib/company-profile-completion";
import { supabase } from "@/lib/supabase";
import type { PublicCompanyProfile } from "@/types/company";

const FEATURED_SUPPLIER_LIMIT = 8;

export type FeaturedSupplier = {
  id: string;
  company_slug: string;
  company_logo: string | null;
  company_name: string;
  about_company: string;
  industry: string;
  country: string;
  supplier_type: string;
  published_product_count: number;
  is_verified: boolean;
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

function countPublishedProductsByUser(rows: { user_id: string }[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const userId = row.user_id;
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
}

export function isFeaturedSupplierVerified(profile: PublicCompanyProfile) {
  return calculateCompanyProfileCompletion(profile) === 100;
}

export function getFeaturedSupplierHref(supplier: FeaturedSupplier) {
  const slug = supplier.company_slug.trim();
  return slug ? `/company/${slug}` : null;
}

export function getFeaturedSupplierExcerpt(supplier: FeaturedSupplier) {
  const about = supplier.about_company.trim();
  return about || "Global supplier on Tradexo.";
}

export function formatFeaturedSupplierProductCount(count: number) {
  return `${count} published product${count === 1 ? "" : "s"}`;
}

export async function fetchFeaturedSuppliers(limit = FEATURED_SUPPLIER_LIMIT) {
  const { data: publishedRows, error: productsError } = await supabase
    .from("products")
    .select("user_id")
    .eq("status", "published");

  if (productsError) {
    return { data: null, error: productsError };
  }

  const productCounts = countPublishedProductsByUser(publishedRows ?? []);
  if (productCounts.size === 0) {
    return { data: [], error: null };
  }

  const rankedEntries = [...productCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  const candidateIds = rankedEntries
    .slice(0, Math.max(limit * 3, limit))
    .map(([userId]) => userId);

  if (candidateIds.length === 0) {
    return { data: [], error: null };
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, company_slug, company_logo, company_name, about_company, industry, business_type, year_established, number_of_employees, address, country, city, website, linkedin, certifications, export_markets, import_markets, role"
    )
    .in("id", candidateIds);

  if (profilesError) {
    return { data: null, error: profilesError };
  }

  const profileMap = new Map(
    (profileRows ?? []).map((row) => [row.id as string, row])
  );

  const suppliers: FeaturedSupplier[] = [];

  for (const userId of candidateIds) {
    const row = profileMap.get(userId);
    if (!row) continue;

    const companyName = ((row.company_name as string) ?? "").trim();
    const companySlug = ((row.company_slug as string) ?? "").trim();
    if (!companyName || !companySlug) continue;

    const profile = mapProfileForCompletion(row as Record<string, unknown>);
    const publishedProductCount = productCounts.get(userId) ?? 0;
    if (publishedProductCount === 0) continue;

    suppliers.push({
      id: userId,
      company_slug: companySlug,
      company_logo: (row.company_logo as string | null) ?? null,
      company_name: companyName,
      about_company: (row.about_company as string) ?? "",
      industry: (row.industry as string) ?? "",
      country: (row.country as string) ?? "",
      supplier_type: ((row.role as string) ?? "").trim() || "Supplier",
      published_product_count: publishedProductCount,
      is_verified: isFeaturedSupplierVerified(profile),
    });

    if (suppliers.length >= limit) {
      break;
    }
  }

  return { data: suppliers, error: null };
}
