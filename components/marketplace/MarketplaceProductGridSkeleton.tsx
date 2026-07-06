function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

export default function MarketplaceProductGridSkeleton() {
  return (
    <>
      <SkeletonBlock className="h-4 w-24" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
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
              <div className="flex gap-3">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
              <SkeletonBlock className="h-6 w-28" />
              <SkeletonBlock className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
