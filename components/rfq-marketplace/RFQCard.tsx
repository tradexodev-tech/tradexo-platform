import Link from "next/link";
import { Calendar, MapPin, Package } from "lucide-react";

import {
  getPublicRFQMatchConfidenceClassName,
  getPublicRFQMatchReasons,
  type PublicRFQListItem,
} from "@/hooks/usePublicRFQs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RFQ_BUDGET_TYPE_OPTIONS } from "@/types/rfq";

type RFQCardProps = {
  item: PublicRFQListItem;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function RFQCard({ item }: RFQCardProps) {
  const { rfq, match } = item;
  const budgetLabel =
    RFQ_BUDGET_TYPE_OPTIONS.find((option) => option.value === rfq.budget_type)
      ?.label ?? rfq.budget_type;
  const matchReasons = match ? getPublicRFQMatchReasons(match, 3) : [];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      {match ? (
        <div className="border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/50 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
              AI Match {match.score}%
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                getPublicRFQMatchConfidenceClassName(match.confidence)
              )}
            >
              Confidence: {match.confidence}
            </span>
          </div>
          {matchReasons.length > 0 ? (
            <ul className="mt-3 space-y-1.5" aria-label="Top match reasons">
              {matchReasons.map((reason) => (
                <li key={reason} className="text-sm text-foreground">
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{rfq.title}</h3>
          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
            Open
          </span>
        </div>

        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {rfq.industry ? <p>Industry: {rfq.industry}</p> : null}
          {rfq.industry_category ? (
            <p>Industry Category: {rfq.industry_category}</p>
          ) : null}
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {rfq.delivery_country}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Package className="size-4 shrink-0" aria-hidden="true" />
            {rfq.quantity} {rfq.unit}
          </p>
          <p>Budget Type: {budgetLabel}</p>
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            Required Before: {formatDate(rfq.required_before)}
          </p>
          <p>Created: {formatDate(rfq.created_at)}</p>
        </div>

        <div className="mt-5">
          <Button asChild className="w-full">
            <Link href={`/rfqs/${rfq.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
