import type { Metadata } from "next";

import MarketplaceView from "@/components/marketplace/MarketplaceView";
import Navbar from "@/components/landing/Navbar";
import type { MarketplaceSort } from "@/lib/catalog";
import {
  fetchPublishedProducts,
  type MarketplaceFilters,
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
    sort?: string;
  }>;
};

function parseSort(value?: string): MarketplaceSort {
  if (value === "oldest" || value === "name") return value;
  return "newest";
}

function parseFilters(searchParams: Awaited<PageProps["searchParams"]>): MarketplaceFilters & {
  sort: MarketplaceSort;
} {
  return {
    search: searchParams.q?.trim() || undefined,
    category: searchParams.category?.trim() || undefined,
    country: searchParams.country?.trim() || undefined,
    industry: searchParams.industry?.trim() || undefined,
    sort: parseSort(searchParams.sort),
  };
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);
  const { data: products, error } = await fetchPublishedProducts(filters);

  return (
    <>
      <Navbar />
      <MarketplaceView
        products={products ?? []}
        filters={filters}
        errorMessage={error?.message ?? null}
      />
    </>
  );
}
