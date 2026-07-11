"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin, Package, Paperclip } from "lucide-react";

import AIMatchExplanation from "@/components/ai/AIMatchExplanation";
import QuotationForm from "@/components/quotation/QuotationForm";
import { getProfile, getUser } from "@/lib/auth";
import {
  fetchSupplierQuotationForRFQ,
  submitQuotation,
  updateQuotation,
} from "@/lib/quotation";
import { isSupplierRole } from "@/lib/recommended-buyers";
import type { Quotation } from "@/types/quotation";
import {
  computeRFQMatch,
  fetchSupplierRFQMatchContext,
  getPublicRFQMatchConfidenceClassName,
  getPublicRFQMatchReasons,
  type SupplierRFQMatchContext,
} from "@/hooks/usePublicRFQs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIMatchResult } from "@/types/ai-match";
import type { RFQ } from "@/types/rfq";
import { RFQ_BUDGET_TYPE_OPTIONS } from "@/types/rfq";

type RFQDetailProps = {
  rfq: RFQ;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatBudget(rfq: RFQ) {
  const budgetLabel =
    RFQ_BUDGET_TYPE_OPTIONS.find((option) => option.value === rfq.budget_type)
      ?.label ?? rfq.budget_type;

  if (rfq.target_price != null) {
    return `${rfq.currency} ${rfq.target_price.toLocaleString()} (${budgetLabel})`;
  }

  return budgetLabel;
}

export default function RFQDetail({ rfq }: RFQDetailProps) {
  const [supplierContext, setSupplierContext] =
    useState<SupplierRFQMatchContext | null>(null);
  const [match, setMatch] = useState<AIMatchResult | null>(null);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [existingQuotation, setExistingQuotation] = useState<Quotation | null>(
    null
  );
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSupplierContext() {
      const [{ data: authData }, context, quotationResult] = await Promise.all([
        getUser(),
        fetchSupplierRFQMatchContext(),
        fetchSupplierQuotationForRFQ(rfq.id),
      ]);

      if (cancelled) {
        return;
      }

      setIsAuthenticated(Boolean(authData.user));

      if (authData.user) {
        const { data: profile } = await getProfile();
        setIsSupplier(isSupplierRole(profile?.role));
      } else {
        setIsSupplier(false);
      }

      setSupplierContext(context);
      setMatch(
        context ? computeRFQMatch(rfq, context.supplierMatchProfile) : null
      );
      setExistingQuotation(quotationResult.data);
    }

    void loadSupplierContext();

    return () => {
      cancelled = true;
    };
  }, [rfq]);

  useEffect(() => {
    if (!actionMessage && !actionError) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActionMessage(null);
      setActionError(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [actionMessage, actionError]);

  const matchReasons = match ? getPublicRFQMatchReasons(match, 3) : [];
  const canSubmitQuotation =
    isSupplier &&
    (!existingQuotation || existingQuotation.status === "withdrawn");
  const canUpdateQuotation = existingQuotation?.status === "submitted";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/rfqs">
          <ArrowLeft className="size-4" />
          Back to RFQs
        </Link>
      </Button>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{rfq.title}</h1>
            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
              Open
            </span>
          </div>
        </div>

        {match ? (
          <div className="border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/50 px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
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
              <ul className="mt-3 space-y-2" aria-label="Top match reasons">
                {matchReasons.map((reason) => (
                  <li key={reason} className="text-sm text-foreground">
                    {reason}
                  </li>
                ))}
              </ul>
            ) : null}
            {supplierContext ? (
              <div className="mt-4">
                <AIMatchExplanation
                  input={{
                    match,
                    perspective: "supplier",
                    supplierImprovement: supplierContext.supplierImprovement,
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-6 px-6 py-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
              {rfq.description}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Delivery Location
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {rfq.delivery_country}
                {rfq.delivery_city ? `, ${rfq.delivery_city}` : ""}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Quantity</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="size-4" aria-hidden="true" />
                {rfq.quantity} {rfq.unit}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Budget</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatBudget(rfq)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Industry</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {rfq.industry || "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Industry Category
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {rfq.industry_category || "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Required Before
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" aria-hidden="true" />
                {formatDate(rfq.required_before)}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-dashed bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <Paperclip className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Attachments
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rfq.attachment_urls.length > 0
                    ? "Attachment downloads will be available in a future release."
                    : "No attachments provided for this RFQ."}
                </p>
              </div>
            </div>
          </section>

          <div className="border-t pt-6">
            {!isAuthenticated ? (
              <>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/login">Sign in to Submit Quotation</Link>
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Suppliers must sign in to submit a quotation.
                </p>
              </>
            ) : !isSupplier ? (
              <p className="text-sm text-muted-foreground">
                Only supplier accounts can submit quotations for this RFQ.
              </p>
            ) : canUpdateQuotation ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  You submitted a quotation for this RFQ (
                  {existingQuotation.currency}{" "}
                  {existingQuotation.price.toLocaleString()}).
                </p>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setFormOpen(true)}
                >
                  Update Quotation
                </Button>
              </>
            ) : canSubmitQuotation ? (
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setFormOpen(true)}
              >
                Submit Quotation
              </Button>
            ) : existingQuotation ? (
              <p className="text-sm text-muted-foreground">
                Your quotation for this RFQ is {existingQuotation.status}.
              </p>
            ) : null}

            {actionMessage ? (
              <p className="mt-3 text-sm text-green-700">{actionMessage}</p>
            ) : null}
            {actionError ? (
              <p className="mt-3 text-sm text-destructive">{actionError}</p>
            ) : null}
          </div>
        </div>
      </div>

      {formOpen ? (
        <QuotationForm
          key={existingQuotation?.id ?? "new"}
          open={formOpen}
          rfq={rfq}
          quotation={canUpdateQuotation ? existingQuotation : null}
          saving={submitting}
          onClose={() => setFormOpen(false)}
          onSubmit={async (input) => {
            setSubmitting(true);
            setActionError(null);

            const { data, error } = await submitQuotation(input);

            setSubmitting(false);

            if (error) {
              setActionError(error.message ?? "Failed to submit quotation.");
              return;
            }

            setExistingQuotation(data);
            setFormOpen(false);
            setActionMessage("Quotation submitted successfully.");
          }}
          onUpdate={
            canUpdateQuotation && existingQuotation
              ? async (id, input) => {
                  setSubmitting(true);
                  setActionError(null);

                  const { data, error } = await updateQuotation(id, input);

                  setSubmitting(false);

                  if (error) {
                    setActionError(error.message ?? "Failed to update quotation.");
                    return;
                  }

                  setExistingQuotation(data);
                  setFormOpen(false);
                  setActionMessage("Quotation updated successfully.");
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
