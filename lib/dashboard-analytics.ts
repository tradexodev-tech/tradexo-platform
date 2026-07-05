import { getCurrentUserId } from "@/lib/products";
import { supabase } from "@/lib/supabase";

export type MonthlyInquiryDataPoint = {
  monthKey: string;
  monthLabel: string;
  count: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastTwelveMonthStart(referenceDate: Date) {
  const start = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() - 11,
    1
  );
  start.setHours(0, 0, 0, 0);
  return start;
}

export function buildMonthlyInquirySeries(
  createdAtValues: string[],
  referenceDate = new Date()
): MonthlyInquiryDataPoint[] {
  const buckets: MonthlyInquiryDataPoint[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - offset,
      1
    );

    buckets.push({
      monthKey: getMonthKey(monthDate),
      monthLabel: MONTH_LABELS[monthDate.getMonth()],
      count: 0,
    });
  }

  const countByMonthKey = new Map<string, number>(
    buckets.map((bucket) => [bucket.monthKey, 0])
  );

  for (const createdAt of createdAtValues) {
    if (!createdAt) continue;

    const inquiryDate = new Date(createdAt);
    const monthKey = getMonthKey(inquiryDate);

    if (!countByMonthKey.has(monthKey)) continue;

    countByMonthKey.set(monthKey, (countByMonthKey.get(monthKey) ?? 0) + 1);
  }

  return buckets.map((bucket) => ({
    ...bucket,
    count: countByMonthKey.get(bucket.monthKey) ?? 0,
  }));
}

export async function fetchMonthlyInquiryAnalytics() {
  const { userId, error: authError } = await getCurrentUserId();
  if (!userId) {
    return { data: null, error: authError ?? { message: "User not authenticated" } };
  }

  const rangeStart = getLastTwelveMonthStart(new Date());

  const { data, error } = await supabase
    .from("inquiries")
    .select("created_at")
    .eq("supplier_user_id", userId)
    .gte("created_at", rangeStart.toISOString());

  if (error) {
    return { data: null, error };
  }

  const series = buildMonthlyInquirySeries(
    (data ?? [])
      .map((row) => row.created_at)
      .filter((value): value is string => typeof value === "string")
  );

  return { data: series, error: null };
}
