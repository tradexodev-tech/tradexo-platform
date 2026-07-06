import FeaturedSupplierCard from "@/components/marketplace/FeaturedSupplierCard";
import type { FeaturedSupplier } from "@/lib/featured-suppliers";

type FeaturedSuppliersProps = {
  suppliers: FeaturedSupplier[];
  loading?: boolean;
  errorMessage?: string | null;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export function FeaturedSuppliersSkeleton() {
  return (
    <section className="mb-10" aria-hidden="true">
      <SkeletonBlock className="h-7 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-3 w-full" />
            <SkeletonBlock className="mt-2 h-3 w-5/6" />
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedSuppliersEmpty() {
  return (
    <section className="mb-10 rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">
        Featured Suppliers
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        No featured suppliers yet. Check back as more companies publish
        products.
      </p>
    </section>
  );
}

export default function FeaturedSuppliers({
  suppliers,
  loading = false,
  errorMessage,
}: FeaturedSuppliersProps) {
  if (loading) {
    return <FeaturedSuppliersSkeleton />;
  }

  if (errorMessage) {
    return (
      <section className="mb-10 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Featured Suppliers
        </h2>
        <p className="mt-2 text-sm text-destructive">
          {errorMessage}. Unable to load featured suppliers.
        </p>
      </section>
    );
  }

  if (suppliers.length === 0) {
    return <FeaturedSuppliersEmpty />;
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Featured Suppliers
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Top suppliers with active published listings on Tradexo
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {suppliers.map((supplier) => (
          <FeaturedSupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </section>
  );
}
