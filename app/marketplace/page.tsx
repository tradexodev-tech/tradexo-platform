import type { Metadata } from "next";

import MarketplaceView from "@/components/marketplace/MarketplaceView";
import Navbar from "@/components/landing/Navbar";
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
  const { data: products, error } = await fetchPublishedProducts(filters);

  return (
    <>
      <Navbar />
      <MarketplaceView
        products={products ?? []}
        errorMessage={error?.message ?? null}
      />
    </>
  );
}
