"use client";

import FeaturedSupplierCard from "@/components/marketplace/FeaturedSupplierCard";
import { FeaturedSuppliersSkeleton } from "@/components/marketplace/FeaturedSuppliers";
import AIMatchExplanation from "@/components/ai/AIMatchExplanation";
import {
  getRecommendedMatchConfidenceClassName,
  type RecommendedSupplier,
  type RecommendedSuppliersBuyerContext,
} from "@/lib/recommended-suppliers";
import { cn } from "@/lib/utils";

type RecommendedSuppliersProps = {
  suppliers: RecommendedSupplier[];
  buyerImprovement?: RecommendedSuppliersBuyerContext;
  loading?: boolean;
};

function RecommendedSupplierMatchPanel({
  supplier,
}: {
  supplier: RecommendedSupplier;
}) {
  const { recommendation } = supplier;

  if (recommendation.kind === "suggested") {
    return (
      <div className="border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/50 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
            AI Suggested
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              getRecommendedMatchConfidenceClassName("Suggested")
            )}
          >
            Confidence: Suggested
          </span>
        </div>

        <ul className="mt-3 space-y-1.5" aria-label="Suggestion reasons">
          {recommendation.reasons.map((reason) => (
            <li key={reason} className="text-sm text-foreground">
              {reason}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/50 px-5 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
          AI Match {recommendation.score}%
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
            getRecommendedMatchConfidenceClassName(recommendation.confidence)
          )}
        >
          Confidence: {recommendation.confidence}
        </span>
      </div>
    </div>
  );
}

export default function RecommendedSuppliers({
  suppliers,
  buyerImprovement,
  loading = false,
}: RecommendedSuppliersProps) {
  if (loading) {
    return <FeaturedSuppliersSkeleton />;
  }

  if (suppliers.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Recommended Suppliers
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        AI-powered recommendations based on your interests.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {suppliers.map((supplier) => (
          <article
            key={supplier.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <RecommendedSupplierMatchPanel supplier={supplier} />
            <div className="flex flex-1 [&>a]:h-full [&>a]:rounded-none [&>a]:border-0 [&>a]:shadow-none [&>a]:hover:translate-y-0">
              <FeaturedSupplierCard supplier={supplier} />
            </div>
            {supplier.recommendation.kind === "match" && buyerImprovement ? (
              <AIMatchExplanation
                className="mt-auto"
                input={{
                  match: supplier.recommendation,
                  perspective: "buyer",
                  buyerImprovement,
                }}
              />
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
