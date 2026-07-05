"use client";

import KpiCard from "@/components/dashboard/KpiCard";
import MonthlyInquiryChart from "@/components/dashboard/MonthlyInquiryChart";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export default function DashboardAnalytics() {
  const {
    metrics,
    monthlyInquiries,
    recentActivity,
    loading,
    monthlyLoading,
    activityLoading,
    error,
    monthlyError,
    activityError,
  } = useDashboardAnalytics();

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}. Unable to load dashboard analytics.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            title="Total Products"
            value={String(metrics.totalProducts)}
            description="In your catalog"
            loading={loading}
          />
          <KpiCard
            title="Total Inquiries"
            value={String(metrics.totalInquiries)}
            description="All buyer inquiries"
            loading={loading}
          />
          <KpiCard
            title="New Inquiries"
            value={String(metrics.newInquiries)}
            description="Awaiting review"
            loading={loading}
          />
          <KpiCard
            title="Replied Inquiries"
            value={String(metrics.repliedInquiries)}
            description="Responses sent"
            loading={loading}
          />
          <KpiCard
            title="Company Profile Completion"
            value={`${metrics.profileCompletion}%`}
            description="Required fields completed"
            loading={loading}
          />
        </div>
      )}

      <MonthlyInquiryChart
        data={monthlyInquiries}
        loading={monthlyLoading}
        error={monthlyError}
      />

      <RecentActivityFeed
        activities={recentActivity}
        loading={activityLoading}
        error={activityError}
      />
    </div>
  );
}
