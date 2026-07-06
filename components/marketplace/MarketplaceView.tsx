import MarketplaceResults from "@/components/marketplace/MarketplaceResults";
import type { MarketplaceProduct } from "@/lib/product-public";

type MarketplaceViewProps = {
  products: MarketplaceProduct[];
  errorMessage?: string | null;
};

export default function MarketplaceView({
  products,
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

        <MarketplaceResults
          products={products}
          errorMessage={errorMessage}
        />
      </div>
    </main>
  );
}
