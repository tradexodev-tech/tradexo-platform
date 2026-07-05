import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/product";

const statusConfig: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  published: {
    label: "Published",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground ring-border",
  },
  pending_approval: {
    label: "Pending Approval",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
};

type ProductStatusBadgeProps = {
  status: ProductStatus;
  className?: string;
};

export default function ProductStatusBadge({
  status,
  className,
}: ProductStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "pending_approval", label: "Pending Approval" },
];
