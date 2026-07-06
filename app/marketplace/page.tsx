import type { Metadata } from "next";

import MarketplaceView from "@/components/marketplace/MarketplaceView";
import Navbar from "@/components/landing/Navbar";
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

  const [productsResult, featuredSuppliersResult] = await Promise.all([
    fetchPublishedProducts(filters),
    fetchFeaturedSuppliers(),
  ]);

  const { data: products, error } = productsResult;
  const {
    data: featuredSuppliers,
    error: featuredSuppliersError,
  } = featuredSuppliersResult;

  return (
    <>
      <Navbar />
      <MarketplaceView
        products={products ?? []}
        featuredSuppliers={featuredSuppliers ?? []}
        featuredSuppliersError={featuredSuppliersError?.message ?? null}
        errorMessage={error?.message ?? null}
      />
    </>
  );
}
