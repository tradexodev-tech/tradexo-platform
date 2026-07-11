import { cn } from "@/lib/utils";
import type { RFQStatus } from "@/types/rfq";
import { RFQ_STATUS_OPTIONS } from "@/types/rfq";

const statusClassNames: Record<RFQStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-600/20",
  open: "bg-green-50 text-green-700 ring-green-600/20",
  closed: "bg-muted text-muted-foreground ring-border",
  cancelled: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

type RFQStatusBadgeProps = {
  status: RFQStatus;
  className?: string;
};

export default function RFQStatusBadge({
  status,
  className,
}: RFQStatusBadgeProps) {
  const label =
    RFQ_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusClassNames[status],
        className
      )}
    >
      {label}
    </span>
  );
}
