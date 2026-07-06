"use client";

import { useTrackRecentlyViewed } from "@/hooks/useRecentlyViewed";

type RecentlyViewedViewTrackerProps = {
  productId: string;
};

export default function RecentlyViewedViewTracker({
  productId,
}: RecentlyViewedViewTrackerProps) {
  useTrackRecentlyViewed(productId);
  return null;
}
