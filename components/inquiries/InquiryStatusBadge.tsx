import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/types/inquiry";

const statusConfig: Record<
  InquiryStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  read: {
    label: "Read",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  replied: {
    label: "Replied",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground ring-border",
  },
};

type InquiryStatusBadgeProps = {
  status: InquiryStatus;
  className?: string;
};

export default function InquiryStatusBadge({
  status,
  className,
}: InquiryStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.new;

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
