import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  );
}

export default function InquiryLoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <SkeletonBlock className="h-8 w-36" />
        <SkeletonBlock className="mt-2 h-5 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="mt-3 h-9 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-3 border-b pb-6">
        <SkeletonBlock className="h-10 w-full rounded-lg" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <SkeletonBlock className="h-10 flex-1 rounded-lg" />
          <SkeletonBlock className="h-10 flex-1 rounded-lg" />
        </div>
      </div>

      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="space-y-0 border-b px-4 py-3">
            <SkeletonBlock className="h-4 w-full" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              <SkeletonBlock className="size-9 shrink-0 rounded-full" />
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-5 w-14 rounded-full" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="ml-auto h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <SkeletonBlock className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
              <SkeletonBlock className="h-5 w-14 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-3 w-28" />
            <SkeletonBlock className="mt-4 h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
