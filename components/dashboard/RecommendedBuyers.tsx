"use client";

import { Building2, MapPin, User } from "lucide-react";

import AIMatchExplanation from "@/components/ai/AIMatchExplanation";
import {
  getRecommendedMatchConfidenceClassName,
} from "@/lib/recommended-suppliers";
import type { AIDashboardSuggestionInput } from "@/lib/ai-dashboard";
import {
  isSupplierRole,
  type RecommendedBuyer,
  type RecommendedBuyersFetchResult,
  type RecommendedBuyersSupplierProfile,
} from "@/lib/recommended-buyers";
import { cn } from "@/lib/utils";

type RecommendedBuyersProps = {
  supplierProfile: RecommendedBuyersSupplierProfile | null;
  supplierRole: string | null;
  data?: RecommendedBuyersFetchResult | null;
  supplierImprovement?: AIDashboardSuggestionInput | null;
  loading?: boolean;
  error?: string | null;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

function RecommendedBuyersSkeleton() {
  return (
    <section className="space-y-4" aria-hidden="true">
      <SkeletonBlock className="h-7 w-56" />
      <SkeletonBlock className="h-4 w-80 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="mt-3 h-3 w-1/2" />
            <SkeletonBlock className="mt-4 h-3 w-2/3" />
            <SkeletonBlock className="mt-2 h-3 w-1/3" />
            <SkeletonBlock className="mt-5 h-8 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendedBuyerCard({
  buyer,
  supplierImprovement,
}: {
  buyer: RecommendedBuyer;
  supplierImprovement?: AIDashboardSuggestionInput | null;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <Building2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground">
              {buyer.company_name}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <User className="size-3.5" aria-hidden="true" />
              {buyer.full_name}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Country</dt>
            <dd>{buyer.country}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Industry</dt>
            <dd className="mt-1 font-medium text-foreground">{buyer.industry}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
            AI Match {buyer.match.score}%
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              getRecommendedMatchConfidenceClassName(buyer.match.confidence)
            )}
          >
            Confidence: {buyer.match.confidence}
          </span>
        </div>
      </div>

      {supplierImprovement ? (
        <AIMatchExplanation
          className="mt-auto"
          input={{
            match: buyer.match,
            perspective: "supplier",
            supplierImprovement,
          }}
        />
      ) : null}
    </article>
  );
}

export default function RecommendedBuyers({
  supplierRole,
  data,
  supplierImprovement,
  loading = false,
  error = null,
}: RecommendedBuyersProps) {
  if (!isSupplierRole(supplierRole)) {
    return null;
  }

  if (loading) {
    return <RecommendedBuyersSkeleton />;
  }

  const buyers = data?.buyers ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Recommended Buyers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered buyer matches based on your company profile and products.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {buyers.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            No buyer recommendations available yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buyers.map((buyer) => (
            <RecommendedBuyerCard
              key={buyer.id}
              buyer={buyer}
              supplierImprovement={supplierImprovement}
            />
          ))}
        </div>
      )}
    </section>
  );
}
