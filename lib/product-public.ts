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
  company_logo?: string | null;
  is_verified?: boolean;
};

export type MarketplaceProduct = Product & {
  company: MarketplaceCompanyInfo | null;
};

export function mapPublishedProduct(row: Record<string, unknown>): Product {
  return mapProduct(row);
}

export type MarketplaceFilters = {
  search?: string;
  category?: string;
  country?: string;
  industry?: string;
  supplierType?: string;
  sort?: "newest" | "oldest" | "name";
};

export type ResolvedMarketplaceFilters = Required<
  Pick<MarketplaceFilters, "sort">
> &
  MarketplaceFilters;

/** Escape user input for PostgREST `.or()` ilike filters. */
function buildPostgrestIlikePattern(search: string) {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '""')
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  return `"%${escaped}%"`;
}

function optionalFilterValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseMarketplaceFilters(
  searchParams: Record<string, string | undefined>
): ResolvedMarketplaceFilters {
  const sort = searchParams.sort;
  const parsedSort =
    sort === "oldest" || sort === "name" ? sort : ("newest" as const);

  return {
    search: optionalFilterValue(searchParams.q),
    category: optionalFilterValue(searchParams.category),
    country: optionalFilterValue(searchParams.country),
    industry: optionalFilterValue(searchParams.industry),
    supplierType: optionalFilterValue(searchParams.supplierType),
    sort: parsedSort,
  };
}

export function buildMarketplaceQueryString(filters: MarketplaceFilters) {
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
  if (filters.supplierType?.trim()) {
    params.set("supplierType", filters.supplierType.trim());
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function marketplaceFiltersAreActive(filters: MarketplaceFilters) {
  return Boolean(
    filters.search?.trim() ||
      filters.category?.trim() ||
      filters.country?.trim() ||
      filters.industry?.trim() ||
      filters.supplierType?.trim()
  );
}

export async function fetchMarketplaceCompaniesByUserIds(
  userIds: string[]
): Promise<Map<string, MarketplaceCompanyInfo>> {
  return fetchCompaniesByUserIds(userIds);
}

export function attachMarketplaceCompanyInfo(
  products: Product[],
  companies: Map<string, MarketplaceCompanyInfo>
): MarketplaceProduct[] {
  return attachCompanyInfo(products, companies);
}

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

async function resolveSupplierUserIds(filters: {
  industry?: string;
  supplierType?: string;
  search?: string;
}) {
  const industry = filters.industry?.trim();
  const supplierType = filters.supplierType?.trim();
  const search = filters.search?.trim();

  let constrainedIds: string[] | null = null;

  if (industry || supplierType) {
    let profileQuery = supabase.from("profiles").select("id");

    if (industry) {
      profileQuery = profileQuery.eq("industry", industry);
    }
    if (supplierType) {
      profileQuery = profileQuery.eq("role", supplierType);
    }

    const { data, error } = await profileQuery;
    if (error) {
      return { constrainedIds: null, nameMatchIds: [] as string[], error };
    }

    constrainedIds = (data ?? []).map((profile) => profile.id as string);
    if (constrainedIds.length === 0) {
      return { constrainedIds: [], nameMatchIds: [], error: null };
    }
  }

  let nameMatchIds: string[] = [];
  if (search) {
    const pattern = buildPostgrestIlikePattern(search);
    let nameQuery = supabase
      .from("profiles")
      .select("id")
      .or(`company_name.ilike.${pattern}`);

    if (constrainedIds) {
      nameQuery = nameQuery.in("id", constrainedIds);
    }

    const { data, error } = await nameQuery;
    if (error) {
      return { constrainedIds, nameMatchIds: [], error };
    }

    nameMatchIds = (data ?? []).map((profile) => profile.id as string);
  }

  return { constrainedIds, nameMatchIds, error: null };
}

export async function fetchPublishedProducts(filters: MarketplaceFilters = {}) {
  const {
    search,
    category,
    country,
    industry,
    supplierType,
    sort = "newest",
  } = filters;

  const supplierResult = await resolveSupplierUserIds({
    industry,
    supplierType,
    search,
  });

  if (supplierResult.error) {
    return { data: null, error: supplierResult.error };
  }

  const { constrainedIds, nameMatchIds } = supplierResult;
  if (constrainedIds && constrainedIds.length === 0) {
    return { data: [], error: null };
  }

  let query = supabase.from("products").select("*").eq("status", "published");

  if (category?.trim()) {
    query = query.eq("product_category", category.trim());
  }

  if (country?.trim()) {
    query = query.eq("country_of_origin", country.trim());
  }

  if (constrainedIds) {
    query = query.in("user_id", constrainedIds);
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const pattern = buildPostgrestIlikePattern(trimmedSearch);
    const productFieldFilters = [
      `product_name.ilike.${pattern}`,
      `short_description.ilike.${pattern}`,
      `full_description.ilike.${pattern}`,
    ];

    if (nameMatchIds.length > 0) {
      productFieldFilters.push(`user_id.in.(${nameMatchIds.join(",")})`);
    }

    query = query.or(productFieldFilters.join(","));
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
