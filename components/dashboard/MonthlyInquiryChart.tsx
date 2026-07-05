"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyInquiryDataPoint } from "@/lib/dashboard-analytics";

type MonthlyInquiryChartProps = {
  data: MonthlyInquiryDataPoint[];
  loading?: boolean;
  error?: string | null;
};

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-6 h-64 w-full rounded-lg" />
    </div>
  );
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Monthly Inquiries</h3>
      <p className="mt-3 text-sm text-destructive">
        {message}. Unable to load monthly inquiry analytics.
      </p>
    </div>
  );
}

export default function MonthlyInquiryChart({
  data,
  loading = false,
  error,
}: MonthlyInquiryChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ChartError message={error} />;
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Monthly Inquiries</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Inquiry volume over the last 12 months
      </p>

      <div className="mt-6 h-64 w-full min-w-0 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
            <Tooltip
              formatter={(value) => [value, "Inquiries"]}
              labelFormatter={(label, payload) => {
                const monthKey = payload?.[0]?.payload?.monthKey as
                  | string
                  | undefined;
                return monthKey ? `${label} (${monthKey})` : label;
              }}
            />
            <Bar
              dataKey="count"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
