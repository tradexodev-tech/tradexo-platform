"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useDashboardAnalytics() {
  const [metrics, setMetrics] = useState<DashboardAnalyticsMetrics>(EMPTY_METRICS);
  const [monthlyInquiries, setMonthlyInquiries] = useState<
    MonthlyInquiryDataPoint[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setMonthlyLoading(true);
    setError(null);
    setMonthlyError(null);

    const { userId, error: authError } = await getCurrentUserId();
    if (authError || !userId) {
      const message = authError?.message ?? "User not authenticated";
      setError(message);
      setMonthlyError(message);
      setMetrics(EMPTY_METRICS);
      setMonthlyInquiries([]);
      setLoading(false);
      setMonthlyLoading(false);
      return;
    }

    const [kpiResults, monthlyResult] = await Promise.all([
      Promise.all([
        fetchProducts(),
        getInquiryCounts(),
        fetchCompanyByUserId(userId),
      ]),
      fetchMonthlyInquiryAnalytics(),
    ]);

    const [productsResult, inquiryCountsResult, companyResult] = kpiResults;

    const kpiFetchError =
      productsResult.error ??
      inquiryCountsResult.error ??
      companyResult.error ??
      null;

    if (kpiFetchError) {
      setError(kpiFetchError.message);
      setMetrics(EMPTY_METRICS);
    } else {
      setMetrics({
        totalProducts: productsResult.data?.length ?? 0,
        totalInquiries: inquiryCountsResult.data?.total ?? 0,
        newInquiries: inquiryCountsResult.data?.new ?? 0,
        repliedInquiries: inquiryCountsResult.data?.replied ?? 0,
        profileCompletion: companyResult.data
          ? calculateCompanyProfileCompletion(companyResult.data)
          : 0,
      });
    }

    if (monthlyResult.error) {
      setMonthlyError(monthlyResult.error.message);
      setMonthlyInquiries([]);
    } else {
      setMonthlyInquiries(monthlyResult.data ?? []);
    }

    setLoading(false);
    setMonthlyLoading(false);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    metrics,
    monthlyInquiries,
    loading,
    monthlyLoading,
    error,
    monthlyError,
    reloadAnalytics: loadAnalytics,
  };
}
