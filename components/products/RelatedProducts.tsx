import MarketplaceProductCard from "@/components/marketplace/MarketplaceProductCard";
import {
  fetchRelatedProducts,
  type RelatedProduct,
  type RelatedProductsInput,
} from "@/lib/related-products";

type RelatedProductsProps = {
  products: RelatedProduct[];
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section
      className="mt-10 border-t pt-8"
      aria-hidden="true"
      aria-busy="true"
    >
      <SkeletonBlock className="h-7 w-40" />
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

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-t pt-8" aria-labelledby="related-products-heading">
      <h2
        id="related-products-heading"
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        Related Products
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <MarketplaceProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export async function RelatedProductsSection({
  input,
}: {
  input: RelatedProductsInput;
}) {
  const { data, error } = await fetchRelatedProducts(input);

  if (error || !data?.length) {
    return null;
  }

  return <RelatedProducts products={data} />;
}
