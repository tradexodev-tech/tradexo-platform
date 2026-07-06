"use client";

import { useEffect, useRef } from "react";

import { trackRecentlyViewedProduct } from "@/lib/recently-viewed";

export function useTrackRecentlyViewed(productId: string) {
  const trackedProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId || trackedProductIdRef.current === productId) {
      return;
    }

    trackedProductIdRef.current = productId;

    void trackRecentlyViewedProduct(productId);
  }, [productId]);
}
