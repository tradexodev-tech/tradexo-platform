import type { Metadata } from "next";

import MarketplaceView from "@/components/marketplace/MarketplaceView";
import Navbar from "@/components/landing/Navbar";
import { getServerProfile } from "@/lib/auth-server";
import { fetchFeaturedProducts } from "@/lib/featured-products";
import { fetchFeaturedSuppliers } from "@/lib/featured-suppliers";
import {
  fetchPublishedProducts,
  parseMarketplaceFilters,
} from "@/lib/product-public";
import {
  buildRecommendedSuppliersBuyerContext,
  fetchRecommendedSuppliers,
} from "@/lib/recommended-suppliers";

export const metadata: Metadata = {
  title: "Marketplace | Tradexo",
  description:
    "Browse published export products from global suppliers on Tradexo.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    industry?: string;
    supplierType?: string;
    sort?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseMarketplaceFilters(resolvedSearchParams);

  const [productsResult, featuredSuppliersResult, featuredProductsResult, profileResult] =
    await Promise.all([
      fetchPublishedProducts(filters),
      fetchFeaturedSuppliers(),
      fetchFeaturedProducts(),
      getServerProfile(),
    ]);

  const { data: products, error } = productsResult;
  const {
    data: featuredSuppliers,
    error: featuredSuppliersError,
  } = featuredSuppliersResult;
  const {
    data: featuredProducts,
    error: featuredProductsError,
  } = featuredProductsResult;
  const buyerContext = buildRecommendedSuppliersBuyerContext(
    profileResult.data,
    filters
  );
  const { data: recommendedSuppliers } = await fetchRecommendedSuppliers(
    buyerContext,
    filters
  );

  return (
    <>
      <Navbar />
      <MarketplaceView
        products={products ?? []}
        featuredSuppliers={featuredSuppliers ?? []}
        featuredProducts={featuredProducts ?? []}
        recommendedSuppliers={recommendedSuppliers ?? []}
        buyerImprovement={buyerContext}
        featuredSuppliersError={featuredSuppliersError?.message ?? null}
        featuredProductsError={featuredProductsError?.message ?? null}
        errorMessage={error?.message ?? null}
      />
    </>
  );
}
