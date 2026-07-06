import MarketplaceProductCard from "@/components/marketplace/MarketplaceProductCard";
import {
  fetchRecentlyViewedProducts,
  type RecentlyViewedProduct,
} from "@/lib/recently-viewed";

type RecentlyViewedProductsProps = {
  products: RecentlyViewedProduct[];
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export function RecentlyViewedProductsSkeleton() {
  return (
    <section
      className="mt-10 border-t pt-8"
      aria-hidden="true"
      aria-busy="true"
    >
      <SkeletonBlock className="h-7 w-44" />
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

export default function RecentlyViewedProducts({
  products,
}: RecentlyViewedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10 border-t pt-8"
      aria-labelledby="recently-viewed-heading"
    >
      <h2
        id="recently-viewed-heading"
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        Recently Viewed
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <MarketplaceProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export async function RecentlyViewedProductsSection({
  excludeProductId,
}: {
  excludeProductId: string;
}) {
  const { data, error } = await fetchRecentlyViewedProducts({
    excludeProductId,
  });

  if (error || !data?.length) {
    return null;
  }

  return <RecentlyViewedProducts products={data} />;
}
