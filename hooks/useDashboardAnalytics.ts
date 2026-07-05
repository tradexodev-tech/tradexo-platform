"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchRecentDashboardActivity,
  type DashboardActivity,
} from "@/lib/dashboard-activity";
import {
  fetchMonthlyInquiryAnalytics,
  type MonthlyInquiryDataPoint,
} from "@/lib/dashboard-analytics";
import { fetchCompanyByUserId } from "@/lib/company";
import { calculateCompanyProfileCompletion } from "@/lib/company-profile-completion";
import { getInquiryCounts } from "@/lib/inquiries";
import { fetchProducts, getCurrentUserId } from "@/lib/products";

export type DashboardAnalyticsMetrics = {
  totalProducts: number;
  totalInquiries: number;
  newInquiries: number;
  repliedInquiries: number;
  profileCompletion: number;
};

const EMPTY_METRICS: DashboardAnalyticsMetrics = {
  totalProducts: 0,
  totalInquiries: 0,
  newInquiries: 0,
  repliedInquiries: 0,
  profileCompletion: 0,
};

type DashboardAnalyticsSnapshot = {
  metrics: DashboardAnalyticsMetrics;
  monthlyInquiries: MonthlyInquiryDataPoint[];
  recentActivity: DashboardActivity[];
  error: string | null;
  monthlyError: string | null;
  activityError: string | null;
};

async function fetchDashboardAnalyticsSnapshot(): Promise<DashboardAnalyticsSnapshot> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    const message = authError?.message ?? "User not authenticated";
    return {
      metrics: EMPTY_METRICS,
      monthlyInquiries: [],
      recentActivity: [],
      error: message,
      monthlyError: message,
      activityError: message,
    };
  }

  const [kpiResults, monthlyResult, activityResult] = await Promise.all([
    Promise.all([
      fetchProducts(),
      getInquiryCounts(),
      fetchCompanyByUserId(userId),
    ]),
    fetchMonthlyInquiryAnalytics(),
    fetchRecentDashboardActivity(),
  ]);

  const [productsResult, inquiryCountsResult, companyResult] = kpiResults;

  const kpiFetchError =
    productsResult.error ??
    inquiryCountsResult.error ??
    companyResult.error ??
    null;

  let metrics = EMPTY_METRICS;
  let error: string | null = null;

  if (kpiFetchError) {
    error = kpiFetchError.message;
  } else {
    metrics = {
      totalProducts: productsResult.data?.length ?? 0,
      totalInquiries: inquiryCountsResult.data?.total ?? 0,
      newInquiries: inquiryCountsResult.data?.new ?? 0,
      repliedInquiries: inquiryCountsResult.data?.replied ?? 0,
      profileCompletion: companyResult.data
        ? calculateCompanyProfileCompletion(companyResult.data)
        : 0,
    };
  }

  return {
    metrics,
    monthlyInquiries: monthlyResult.error ? [] : (monthlyResult.data ?? []),
    recentActivity: activityResult.error ? [] : (activityResult.data ?? []),
    error,
    monthlyError: monthlyResult.error?.message ?? null,
    activityError: activityResult.error?.message ?? null,
  };
}

export function useDashboardAnalytics() {
  const [metrics, setMetrics] = useState<DashboardAnalyticsMetrics>(EMPTY_METRICS);
  const [monthlyInquiries, setMonthlyInquiries] = useState<
    MonthlyInquiryDataPoint[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: DashboardAnalyticsSnapshot) => {
    setMetrics(snapshot.metrics);
    setMonthlyInquiries(snapshot.monthlyInquiries);
    setRecentActivity(snapshot.recentActivity);
    setError(snapshot.error);
    setMonthlyError(snapshot.monthlyError);
    setActivityError(snapshot.activityError);
    setLoading(false);
    setMonthlyLoading(false);
    setActivityLoading(false);
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setMonthlyLoading(true);
    setActivityLoading(true);
    setError(null);
    setMonthlyError(null);
    setActivityError(null);

    const snapshot = await fetchDashboardAnalyticsSnapshot();
    applySnapshot(snapshot);
  }, [applySnapshot]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const snapshot = await fetchDashboardAnalyticsSnapshot();
      if (cancelled) {
        return;
      }
      applySnapshot(snapshot);
    })();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  return {
    metrics,
    monthlyInquiries,
    recentActivity,
    loading,
    monthlyLoading,
    activityLoading,
    error,
    monthlyError,
    activityError,
    reloadAnalytics: loadAnalytics,
  };
}
