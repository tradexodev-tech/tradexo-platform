import MarketplaceProductCard from "@/components/marketplace/MarketplaceProductCard";
import type { FeaturedProduct } from "@/lib/featured-products";

type FeaturedProductsProps = {
  products: FeaturedProduct[];
  loading?: boolean;
  errorMessage?: string | null;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="mb-10" aria-hidden="true">
      <SkeletonBlock className="h-7 w-44" />
      <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <SkeletonBlock className="h-5 w-4/5" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-11/12" />
              <SkeletonBlock className="h-14 w-full rounded-lg" />
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-6 w-28" />
              <SkeletonBlock className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function FeaturedProducts({
  products,
  loading = false,
  errorMessage,
}: FeaturedProductsProps) {
  if (loading) {
    return <FeaturedProductsSkeleton />;
  }

  if (errorMessage || products.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Featured Products
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Highlighted listings from active global suppliers
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <MarketplaceProductCard
            key={product.id}
            product={product}
            variant="featured"
          />
        ))}
      </div>
    </section>
  );
}
