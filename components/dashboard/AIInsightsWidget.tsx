"use client";

import type { AIDashboardInsights } from "@/lib/ai-dashboard";
import { cn } from "@/lib/utils";

type AIInsightsWidgetProps = {
  insights: AIDashboardInsights | null;
  loading?: boolean;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  );
}

function AIInsightsWidgetSkeleton() {
  return (
    <section className="space-y-4" aria-hidden="true">
      <SkeletonBlock className="h-7 w-40" />
      <SkeletonBlock className="h-4 w-72 max-w-full" />
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="mt-4 h-8 w-20" />
            <SkeletonBlock className="mt-3 h-4 w-24" />
            <SkeletonBlock className="mt-2 h-4 w-28" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ConfidenceBar({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: "high" | "medium" | "low";
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{count}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} confidence matches: ${count} of ${total}`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "high" && "bg-emerald-500",
            tone === "medium" && "bg-amber-500",
            tone === "low" && "bg-slate-400"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function AIInsightsWidget({
  insights,
  loading = false,
}: AIInsightsWidgetProps) {
  if (loading) {
    return <AIInsightsWidgetSkeleton />;
  }

  if (!insights) {
    return null;
  }

  const { summary, suggestions, hasRecommendations } = insights;
  const confidenceTotal =
    summary.confidenceCounts.high +
    summary.confidenceCounts.medium +
    summary.confidenceCounts.low;

  return (
    <section className="space-y-4" aria-labelledby="ai-insights-heading">
      <div>
        <h2
          id="ai-insights-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          AI Insights
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recommendation quality and visibility tips for your supplier profile.
        </p>
      </div>

      {!hasRecommendations ? (
        <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Complete your profile and publish products to unlock AI
            recommendations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">
              AI Match Summary
            </h3>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Average Match %
                </dt>
                <dd className="mt-1 text-3xl font-bold text-foreground">
                  {summary.averageMatchScore}%
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Best Match %</dt>
                <dd className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.highestMatchScore}%
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Recommended Buyers
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-foreground">
                  {summary.totalRecommendedBuyers}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">
              Confidence Breakdown
            </h3>
            <div className="mt-4 space-y-4">
              <ConfidenceBar
                label="High"
                count={summary.confidenceCounts.high}
                total={confidenceTotal}
                tone="high"
              />
              <ConfidenceBar
                label="Medium"
                count={summary.confidenceCounts.medium}
                total={confidenceTotal}
                tone="medium"
              />
              <ConfidenceBar
                label="Low"
                count={summary.confidenceCounts.low}
                total={confidenceTotal}
                tone="low"
              />
            </div>
          </article>

          <article className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">
              AI Suggestions
            </h3>
            {suggestions.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Your profile looks strong. Keep publishing products to maintain
                visibility.
              </p>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
