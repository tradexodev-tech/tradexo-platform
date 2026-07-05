import Navbar from "@/components/landing/Navbar";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function PublicCompanyLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="relative isolate">
          <SkeletonBlock className="h-44 sm:h-52 md:h-56" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
            <div className="-mt-14 pb-8 text-center sm:-mt-16">
            <SkeletonBlock className="mx-auto size-28 rounded-2xl sm:size-32" />
            <SkeletonBlock className="mx-auto mt-5 h-8 w-64" />
            <SkeletonBlock className="mx-auto mt-3 h-4 w-40" />
            <SkeletonBlock className="mx-auto mt-3 h-4 w-32" />
            <div className="mt-4 flex justify-center gap-2">
              <SkeletonBlock className="h-8 w-24 rounded-full" />
              <SkeletonBlock className="h-8 w-28 rounded-full" />
            </div>
            <SkeletonBlock className="mx-auto mt-6 h-10 w-44" />
          </div>

          <hr className="border-border" />

          <div className="py-8">
            <SkeletonBlock className="h-6 w-36" />
            <SkeletonBlock className="mt-4 h-20 w-full" />
          </div>

          <hr className="border-border" />

          <div className="py-8">
            <SkeletonBlock className="h-6 w-44" />
            <div className="mt-4 space-y-4">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
            </div>
          </div>

          <hr className="border-border" />

          <div className="py-8 pb-12">
            <SkeletonBlock className="h-6 w-24" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonBlock className="h-72 rounded-xl" />
              <SkeletonBlock className="h-72 rounded-xl" />
              <SkeletonBlock className="hidden h-72 rounded-xl lg:block" />
            </div>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
