import {
  generateSlug,
  normalizeProductStatus,
  parseSpecifications,
  parseVariants,
} from "@/lib/product-utils";
import { supabase } from "@/lib/supabase";
import type { PublicCompanyProfile } from "@/types/company";
import { parseProductImages, type Product } from "@/types/product";

const PUBLIC_COMPANY_FIELDS =
  "id, company_slug, company_logo, company_name, about_company, industry, business_type, year_established, number_of_employees, address, country, city, website, linkedin, certifications, export_markets, import_markets";

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

function mapPublicCompany(row: Record<string, unknown>): PublicCompanyProfile {
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

export async function fetchCompanyBySlug(slug: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_COMPANY_FIELDS)
    .eq("company_slug", slug)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return { data: mapPublicCompany(data), error: null };
}

export async function fetchCompanyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_COMPANY_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return { data: mapPublicCompany(data), error: null };
}

export async function fetchPublishedProductsByCompanyId(companyId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", companyId)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) return { data: null, error };

  return { data: (data ?? []).map(mapProduct), error: null };
}

type ResolveCompanySlugParams = {
  companyName: string;
  existingSlug: string;
  userId: string;
};

export async function resolveCompanySlugForSave({
  companyName,
  existingSlug,
  userId,
}: ResolveCompanySlugParams): Promise<string | null> {
  const trimmedSlug = existingSlug.trim();
  if (trimmedSlug) {
    return trimmedSlug;
  }

  return generateUniqueCompanySlug(companyName, userId);
}

export async function generateUniqueCompanySlug(
  companyName: string,
  userId: string
): Promise<string | null> {
  const baseSlug = generateSlug(companyName);
  if (!baseSlug) return null;

  let candidate = baseSlug;
  let suffix = 0;

  while (true) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("company_slug", candidate)
      .neq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}
