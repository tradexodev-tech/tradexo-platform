import type { Metadata } from "next";

import MarketplaceView from "@/components/marketplace/MarketplaceView";
import Navbar from "@/components/landing/Navbar";
import { fetchFeaturedProducts } from "@/lib/featured-products";
import { fetchFeaturedSuppliers } from "@/lib/featured-suppliers";
import {
  fetchPublishedProducts,
  parseMarketplaceFilters,
} from "@/lib/product-public";

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

  const [productsResult, featuredSuppliersResult, featuredProductsResult] =
    await Promise.all([
      fetchPublishedProducts(filters),
      fetchFeaturedSuppliers(),
      fetchFeaturedProducts(),
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

  return (
    <>
      <Navbar />
      <MarketplaceView
        products={products ?? []}
        featuredSuppliers={featuredSuppliers ?? []}
        featuredProducts={featuredProducts ?? []}
        featuredSuppliersError={featuredSuppliersError?.message ?? null}
        featuredProductsError={featuredProductsError?.message ?? null}
        errorMessage={error?.message ?? null}
      />
    </>
  );
}
