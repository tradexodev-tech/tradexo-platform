import {
  normalizeProductStatus,
  parseSpecifications,
  parseVariants,
} from "@/lib/product-utils";
import { supabase } from "@/lib/supabase";
import { parseProductImages, type Product } from "@/types/product";

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    company_id: (row.company_id as string | null) ?? null,
    product_name: (row.product_name as string) ?? "",
    product_category: (row.product_category as string) ?? "",
    short_description: (row.short_description as string) ?? "",
    full_description: (row.full_description as string) ?? "",
    hs_code: (row.hs_code as string) ?? "",
    country_of_origin: (row.country_of_origin as string) ?? "",
    brand_name: (row.brand_name as string) ?? "",
    model_number: (row.model_number as string) ?? "",
    moq: (row.moq as string) ?? "",
    production_capacity: (row.production_capacity as string) ?? "",
    unit: (row.unit as string) ?? "",
    price_on_request: (row.price_on_request as boolean) ?? true,
    currency: (row.currency as string) ?? "USD",
    price: row.price != null ? Number(row.price) : null,
    lead_time: (row.lead_time as string) ?? "",
    product_images: parseProductImages(row.product_images),
    product_video: (row.product_video as string) ?? "",
    certifications: (row.certifications as string) ?? "",
    specifications: parseSpecifications(row.specifications),
    variants: parseVariants(row.variants),
    seo_title: (row.seo_title as string) ?? "",
    seo_description: (row.seo_description as string) ?? "",
    meta_keywords: (row.meta_keywords as string) ?? "",
    slug: (row.slug as string) ?? "",
    status: normalizeProductStatus(row.status),
    created_at: (row.created_at as string) ?? "",
    updated_at: (row.updated_at as string) ?? "",
  };
}

export type MarketplaceCompanyInfo = {
  company_name: string;
  company_slug: string;
  industry: string;
};

export type MarketplaceProduct = Product & {
  company: MarketplaceCompanyInfo | null;
};

export type MarketplaceFilters = {
  search?: string;
  category?: string;
  country?: string;
  industry?: string;
  sort?: "newest" | "oldest" | "name";
};

async function fetchCompaniesByUserIds(
  userIds: string[]
): Promise<Map<string, MarketplaceCompanyInfo>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, company_name, company_slug, industry")
    .in("id", userIds);

  if (error || !data) return new Map();

  return new Map(
    data.map((row) => [
      row.id as string,
      {
        company_name: (row.company_name as string) ?? "",
        company_slug: (row.company_slug as string) ?? "",
        industry: (row.industry as string) ?? "",
      },
    ])
  );
}

function attachCompanyInfo(
  products: Product[],
  companies: Map<string, MarketplaceCompanyInfo>
): MarketplaceProduct[] {
  return products.map((product) => ({
    ...product,
    company: companies.get(product.user_id) ?? null,
  }));
}

export async function fetchPublishedProducts(filters: MarketplaceFilters = {}) {
  const { search, category, country, industry, sort = "newest" } = filters;

  let userIdsFilter: string[] | null = null;
  if (industry?.trim()) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("industry", industry.trim());

    if (profileError) return { data: null, error: profileError };

    userIdsFilter = (profiles ?? []).map((profile) => profile.id as string);
    if (userIdsFilter.length === 0) {
      return { data: [], error: null };
    }
  }

  let query = supabase.from("products").select("*").eq("status", "published");

  if (category?.trim()) {
    query = query.eq("product_category", category.trim());
  }

  if (country?.trim()) {
    query = query.eq("country_of_origin", country.trim());
  }

  if (userIdsFilter) {
    query = query.in("user_id", userIdsFilter);
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const pattern = `%${trimmedSearch}%`;
    query = query.or(
      `product_name.ilike.${pattern},brand_name.ilike.${pattern},product_category.ilike.${pattern}`
    );
  }

  if (sort === "oldest") {
    query = query.order("updated_at", { ascending: true });
  } else if (sort === "name") {
    query = query.order("product_name", { ascending: true });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return { data: null, error };

  const products = (data ?? []).map(mapProduct);
  const userIds = [...new Set(products.map((product) => product.user_id))];
  const companies = await fetchCompaniesByUserIds(userIds);

  return {
    data: attachCompanyInfo(products, companies),
    error: null,
  };
}

export async function fetchPublishedProductBySlug(slug: string) {
  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", trimmedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return { data: mapProduct(data), error: null };
}

export function getProductSeoTitle(product: Product) {
  return product.seo_title?.trim() || product.product_name || "Product";
}

export function getProductSeoDescription(product: Product) {
  return (
    product.seo_description?.trim() ||
    product.short_description?.trim() ||
    product.full_description?.trim().slice(0, 160) ||
    `View ${product.product_name} on Tradexo.`
  );
}
