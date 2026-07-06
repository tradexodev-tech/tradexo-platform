import {
  attachMarketplaceCompanyInfo,
  fetchMarketplaceCompaniesByUserIds,
  mapPublishedProduct,
  type MarketplaceProduct,
} from "@/lib/product-public";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

const RELATED_PRODUCT_LIMIT = 8;
const RELATED_PRODUCT_CANDIDATE_LIMIT = 100;

export type RelatedProductsInput = {
  productId: string;
  productCategory: string;
  supplierUserId: string;
  supplierIndustry?: string;
};

type RelatedProductTier = 1 | 2 | 3;

function getRelatedProductTier(
  product: Product,
  input: RelatedProductsInput,
  industryByUserId: Map<string, string>
): RelatedProductTier | null {
  if (product.id === input.productId) {
    return null;
  }

  const category = input.productCategory.trim();
  if (category && product.product_category.trim() === category) {
    return 1;
  }

  const supplierIndustry = input.supplierIndustry?.trim();
  const productSupplierIndustry = industryByUserId.get(product.user_id)?.trim();

  if (
    supplierIndustry &&
    productSupplierIndustry &&
    productSupplierIndustry === supplierIndustry
  ) {
    return 2;
  }

  if (product.user_id === input.supplierUserId) {
    return 3;
  }

  return null;
}

function sortByNewest(products: Product[]) {
  return [...products].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function rankRelatedProducts(
  candidates: Product[],
  input: RelatedProductsInput,
  industryByUserId: Map<string, string>,
  limit = RELATED_PRODUCT_LIMIT
) {
  const tierBuckets: Record<RelatedProductTier, Product[]> = {
    1: [],
    2: [],
    3: [],
  };

  for (const product of candidates) {
    const tier = getRelatedProductTier(product, input, industryByUserId);
    if (tier) {
      tierBuckets[tier].push(product);
    }
  }

  const ranked: Product[] = [];
  const seen = new Set<string>();

  for (const tier of [1, 2, 3] as const) {
    const sortedTier = sortByNewest(tierBuckets[tier]);

    for (const product of sortedTier) {
      if (seen.has(product.id)) {
        continue;
      }

      seen.add(product.id);
      ranked.push(product);

      if (ranked.length >= limit) {
        return ranked;
      }
    }
  }

  return ranked;
}

export async function fetchRelatedProducts(input: RelatedProductsInput) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .neq("id", input.productId)
    .order("updated_at", { ascending: false })
    .limit(RELATED_PRODUCT_CANDIDATE_LIMIT);

  if (error) {
    return { data: null, error };
  }

  const candidates = (data ?? []).map(mapPublishedProduct);
  if (candidates.length === 0) {
    return { data: [], error: null };
  }

  const userIds = [
    ...new Set(candidates.map((product) => product.user_id)),
  ];

  const companies = await fetchMarketplaceCompaniesByUserIds(userIds);
  const industryByUserId = new Map(
    [...companies.entries()].map(([userId, company]) => [
      userId,
      company.industry,
    ])
  );

  if (input.supplierIndustry?.trim()) {
    industryByUserId.set(input.supplierUserId, input.supplierIndustry.trim());
  }

  const rankedProducts = rankRelatedProducts(
    candidates,
    input,
    industryByUserId
  );

  return {
    data: attachMarketplaceCompanyInfo(rankedProducts, companies),
    error: null,
  };
}

export type RelatedProduct = MarketplaceProduct;
