import { isFeaturedSupplierVerified } from "@/lib/featured-suppliers";
import {
  mapPublishedProduct,
  type MarketplaceCompanyInfo,
  type MarketplaceProduct,
} from "@/lib/product-public";
import { supabase } from "@/lib/supabase";
import type { PublicCompanyProfile } from "@/types/company";
import { parseProductImages, type Product } from "@/types/product";

const FEATURED_PRODUCT_LIMIT = 8;
const FEATURED_PRODUCT_CANDIDATE_LIMIT = 100;

export type FeaturedProduct = MarketplaceProduct;

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

export function productHasPublishedImage(product: Product) {
  const images = parseProductImages(product.product_images);
  return images.some((image) => Boolean(image.url?.trim()));
}

export function rankFeaturedProducts(products: Product[]) {
  return [...products].sort((a, b) => {
    // Future: sponsored products can be ranked first here.
    const aHasImage = productHasPublishedImage(a) ? 1 : 0;
    const bHasImage = productHasPublishedImage(b) ? 1 : 0;

    if (bHasImage !== aHasImage) {
      return bHasImage - aHasImage;
    }

    return (
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });
}

async function fetchFeaturedProductCompaniesByUserIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, MarketplaceCompanyInfo>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_name, company_slug, industry, company_logo, about_company, business_type, year_established, number_of_employees, address, country, city, website, linkedin, certifications, export_markets, import_markets"
    )
    .in("id", userIds);

  if (error || !data) {
    return new Map<string, MarketplaceCompanyInfo>();
  }

  return new Map(
    data.map((row) => {
      const profile = mapProfileForCompletion(row as Record<string, unknown>);

      return [
        row.id as string,
        {
          company_name: profile.company_name,
          company_slug: profile.company_slug,
          industry: profile.industry,
          company_logo: profile.company_logo,
          is_verified: isFeaturedSupplierVerified(profile),
        },
      ];
    })
  );
}

function attachFeaturedCompanyInfo(
  products: Product[],
  companies: Map<string, MarketplaceCompanyInfo>
): FeaturedProduct[] {
  return products.map((product) => ({
    ...product,
    company: companies.get(product.user_id) ?? null,
  }));
}

export async function fetchFeaturedProducts(limit = FEATURED_PRODUCT_LIMIT) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(FEATURED_PRODUCT_CANDIDATE_LIMIT);

  if (error) {
    return { data: null, error };
  }

  const candidates = (data ?? []).map(mapPublishedProduct);
  if (candidates.length === 0) {
    return { data: [], error: null };
  }

  const rankedProducts = rankFeaturedProducts(candidates).slice(0, limit);
  const userIds = [
    ...new Set(rankedProducts.map((product) => product.user_id)),
  ];
  const companies = await fetchFeaturedProductCompaniesByUserIds(userIds);

  return {
    data: attachFeaturedCompanyInfo(rankedProducts, companies),
    error: null,
  };
}
