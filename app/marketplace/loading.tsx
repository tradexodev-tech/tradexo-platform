import Navbar from "@/components/landing/Navbar";
import { FeaturedSuppliersSkeleton } from "@/components/marketplace/FeaturedSuppliers";
import MarketplaceProductGridSkeleton from "@/components/marketplace/MarketplaceProductGridSkeleton";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function MarketplaceLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-9 w-48" />
          <SkeletonBlock className="mt-2 h-5 w-96 max-w-full" />

          <FeaturedSuppliersSkeleton />

          <div className="space-y-3 border-b pb-6">
            <SkeletonBlock className="h-10 w-full" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
          </div>

          <div className="mt-6">
            <MarketplaceProductGridSkeleton />
          </div>
        </div>
      </main>
    </>
  );
}
