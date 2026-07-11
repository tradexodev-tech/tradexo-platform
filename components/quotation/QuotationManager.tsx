"use client";

import { cn } from "@/lib/utils";

import EmptyQuotationState from "@/components/quotation/EmptyQuotationState";
import QuotationList from "@/components/quotation/QuotationList";
import { useQuotations } from "@/hooks/useQuotations";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function QuotationLoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
          <SkeletonBlock className="mt-4 h-8 w-32 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function QuotationManager() {
  const {
    quotations,
    loading,
    loadError,
    toast,
    withdrawingId,
    openEditForm,
    handleWithdraw,
  } = useQuotations();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Quotations</h2>
          <p className="mt-1 text-muted-foreground">
            Track quotations you have submitted for buyer RFQs.
          </p>
        </div>
        <QuotationLoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Quotations</h2>
        <p className="mt-1 text-muted-foreground">
          Track quotations you have submitted for buyer RFQs.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}. Ensure the quotations table exists in Supabase.
        </div>
      ) : null}

      {quotations.length === 0 && !loadError ? (
        <EmptyQuotationState />
      ) : (
        <QuotationList
          quotations={quotations}
          withdrawingId={withdrawingId}
          onEdit={openEditForm}
          onWithdraw={(quotation) => void handleWithdraw(quotation.id)}
        />
      )}

      {toast ? (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={cn(
            "fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
