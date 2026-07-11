import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export default function RFQSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="mt-3 h-4 w-1/2" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
          <div className="mt-4 flex gap-2">
            <SkeletonBlock className="h-6 w-16 rounded-full" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="mt-5 h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
