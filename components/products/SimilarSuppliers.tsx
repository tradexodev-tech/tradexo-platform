import FeaturedSupplierCard from "@/components/marketplace/FeaturedSupplierCard";
import {
  fetchSimilarSuppliers,
  type SimilarSupplier,
  type SimilarSuppliersInput,
} from "@/lib/similar-suppliers";

type SimilarSuppliersProps = {
  suppliers: SimilarSupplier[];
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export function SimilarSuppliersSkeleton() {
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

export default function SimilarSuppliers({ suppliers }: SimilarSuppliersProps) {
  if (suppliers.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10 border-t pt-8"
      aria-labelledby="similar-suppliers-heading"
    >
      <h2
        id="similar-suppliers-heading"
        className="text-xl font-semibold tracking-tight text-foreground"
      >
        Similar Suppliers
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {suppliers.map((supplier) => (
          <FeaturedSupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>
    </section>
  );
}

export async function SimilarSuppliersSection({
  input,
}: {
  input: SimilarSuppliersInput;
}) {
  const { data, error } = await fetchSimilarSuppliers(input);

  if (error || !data?.length) {
    return null;
  }

  return <SimilarSuppliers suppliers={data} />;
}
