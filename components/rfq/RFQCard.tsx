import { Calendar, MapPin, Package } from "lucide-react";

import RFQStatusBadge from "@/components/rfq/RFQStatusBadge";
import { Button } from "@/components/ui/button";
import type { RFQ } from "@/types/rfq";
import { RFQ_BUDGET_TYPE_OPTIONS } from "@/types/rfq";

type RFQCardProps = {
  rfq: RFQ;
  publishing?: boolean;
  closing?: boolean;
  onEdit?: (rfq: RFQ) => void;
  onPublish?: (rfq: RFQ) => void;
  onClose?: (rfq: RFQ) => void;
  onDelete?: (rfq: RFQ) => void;
};

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function RFQCard({
  rfq,
  publishing = false,
  closing = false,
  onEdit,
  onPublish,
  onClose,
  onDelete,
}: RFQCardProps) {
  const budgetLabel =
    RFQ_BUDGET_TYPE_OPTIONS.find((option) => option.value === rfq.budget_type)
      ?.label ?? rfq.budget_type;

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{rfq.title}</h3>
            <RFQStatusBadge status={rfq.status} />
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {rfq.description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-4 shrink-0" aria-hidden="true" />
              {rfq.quantity} {rfq.unit}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {rfq.delivery_country}
              {rfq.delivery_city ? `, ${rfq.delivery_city}` : ""}
            </span>
            {rfq.required_before ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" aria-hidden="true" />
                Required by {formatDate(rfq.required_before)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-1">
              Budget: {budgetLabel}
            </span>
            {rfq.industry ? (
              <span className="rounded-full bg-muted px-2.5 py-1">
                {rfq.industry}
              </span>
            ) : null}
            {rfq.industry_category ? (
              <span className="rounded-full bg-muted px-2.5 py-1">
                {rfq.industry_category}
              </span>
            ) : null}
            <span className="rounded-full bg-muted px-2.5 py-1 capitalize">
              {rfq.visibility}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
          {rfq.status === "draft" && onEdit ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(rfq)}>
              Edit
            </Button>
          ) : null}
          {rfq.status === "draft" && onPublish ? (
            <Button
              type="button"
              size="sm"
              disabled={publishing}
              onClick={() => onPublish(rfq)}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          ) : null}
          {rfq.status === "open" && onClose ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={closing}
              onClick={() => onClose(rfq)}
            >
              {closing ? "Closing..." : "Close"}
            </Button>
          ) : null}
          {rfq.status === "draft" && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(rfq)}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
