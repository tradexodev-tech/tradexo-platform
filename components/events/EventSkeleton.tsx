import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export default function EventSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <SkeletonBlock className="h-40 w-full rounded-none" />
          <div className="p-5">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-2/3" />
            <div className="mt-4 flex gap-2">
              <SkeletonBlock className="h-6 w-20 rounded-full" />
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
