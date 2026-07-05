type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  loading?: boolean;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function KpiCard({
  title,
  value,
  description,
  loading = false,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>

      {loading ? (
        <SkeletonBlock className="mt-3 h-9 w-20" />
      ) : (
        <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      )}

      {description ? (
        loading ? (
          <SkeletonBlock className="mt-2 h-4 w-32" />
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )
      ) : null}
    </div>
  );
}
