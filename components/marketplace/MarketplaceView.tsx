import FeaturedProducts from "@/components/marketplace/FeaturedProducts";
import FeaturedSuppliers from "@/components/marketplace/FeaturedSuppliers";
import MarketplaceResults from "@/components/marketplace/MarketplaceResults";
import type { FeaturedProduct } from "@/lib/featured-products";
import type { FeaturedSupplier } from "@/lib/featured-suppliers";
import type { MarketplaceProduct } from "@/lib/product-public";

type MarketplaceViewProps = {
  products: MarketplaceProduct[];
  featuredSuppliers: FeaturedSupplier[];
  featuredProducts: FeaturedProduct[];
  featuredSuppliersError?: string | null;
  featuredProductsError?: string | null;
  errorMessage?: string | null;
};

export default function MarketplaceView({
  products,
  featuredSuppliers,
  featuredProducts,
  featuredSuppliersError,
  featuredProductsError,
  errorMessage,
}: MarketplaceViewProps) {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse published products from verified global suppliers.
          </p>
        </div>

        <FeaturedSuppliers
          suppliers={featuredSuppliers}
          errorMessage={featuredSuppliersError}
        />

        <FeaturedProducts
          products={featuredProducts}
          errorMessage={featuredProductsError}
        />

        <MarketplaceResults
          products={products}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  );
}
