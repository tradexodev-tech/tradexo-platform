import Link from "next/link";
import { Calendar, Clock, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuotationWithRFQ } from "@/types/quotation";
import { QUOTATION_STATUS_OPTIONS } from "@/types/quotation";

const statusClassNames: Record<QuotationWithRFQ["status"], string> = {
  submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  accepted: "bg-green-50 text-green-700 ring-green-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  withdrawn: "bg-slate-100 text-slate-700 ring-slate-600/20",
};

type QuotationCardProps = {
  quotation: QuotationWithRFQ;
  withdrawing?: boolean;
  onEdit?: (quotation: QuotationWithRFQ) => void;
  onWithdraw?: (quotation: QuotationWithRFQ) => void;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function QuotationCard({
  quotation,
  withdrawing = false,
  onEdit,
  onWithdraw,
}: QuotationCardProps) {
  const statusLabel =
    QUOTATION_STATUS_OPTIONS.find((option) => option.value === quotation.status)
      ?.label ?? quotation.status;

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {quotation.rfq_title}
            </h3>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                statusClassNames[quotation.status]
              )}
            >
              {statusLabel}
            </span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Price: {quotation.currency}{" "}
              {quotation.price.toLocaleString()}
            </p>
            <p className="inline-flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              Lead Time: {quotation.lead_time}
            </p>
            <p className="inline-flex items-start gap-1.5">
              <MessageSquare className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">{quotation.message}</span>
            </p>
            <p className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0" aria-hidden="true" />
              Submitted: {formatDate(quotation.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
          <Button asChild variant="outline" size="sm">
            <Link href={`/rfqs/${quotation.rfq_id}`}>View RFQ</Link>
          </Button>
          {quotation.status === "submitted" && onEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(quotation)}
            >
              Edit
            </Button>
          ) : null}
          {quotation.status === "submitted" && onWithdraw ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={withdrawing}
              onClick={() => onWithdraw(quotation)}
            >
              {withdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
