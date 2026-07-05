type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  comingSoon?: boolean;
};

export default function StatCard({
  title,
  value,
  description,
  comingSoon = false,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {comingSoon && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
            Coming Soon
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
