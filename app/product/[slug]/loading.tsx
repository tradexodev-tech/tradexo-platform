import Navbar from "@/components/landing/Navbar";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function PublicProductLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <SkeletonBlock className="aspect-[4/3] w-full rounded-xl" />
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-8 w-3/4" />
              <SkeletonBlock className="h-6 w-32" />
              <SkeletonBlock className="h-20 w-full" />
              <SkeletonBlock className="h-40 w-full rounded-xl" />
              <SkeletonBlock className="h-10 w-40" />
            </div>
          </div>
          <SkeletonBlock className="mt-10 h-32 w-full rounded-xl" />
          <SkeletonBlock className="mt-10 h-48 w-full rounded-xl" />
        </div>
      </main>
    </>
  );
}
