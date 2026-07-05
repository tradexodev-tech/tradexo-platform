import Navbar from "@/components/landing/Navbar";

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

          <div className="mt-8 space-y-3 border-b pb-6">
            <SkeletonBlock className="h-10 w-full" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
          </div>

          <SkeletonBlock className="mt-6 h-4 w-24" />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonBlock className="h-72 rounded-xl" />
            <SkeletonBlock className="h-72 rounded-xl" />
            <SkeletonBlock className="hidden h-72 rounded-xl lg:block" />
          </div>
        </div>
      </main>
    </>
  );
}
