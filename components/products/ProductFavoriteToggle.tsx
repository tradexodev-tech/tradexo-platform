"use client";

import { useCallback } from "react";

import ProductFavoriteButton from "@/components/products/ProductFavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";

type ProductFavoriteToggleProps = {
  productId: string;
  productName: string;
  className?: string;
};

export default function ProductFavoriteToggle({
  productId,
  productName,
  className,
}: ProductFavoriteToggleProps) {
  const { isFavorited, toggleFavorite, loading, isToggling } = useFavorites();

  const handleToggle = useCallback(() => {
    void toggleFavorite(productId);
  }, [productId, toggleFavorite]);

  return (
    <ProductFavoriteButton
      productName={productName}
      isFavorited={isFavorited(productId)}
      isLoading={loading || isToggling(productId)}
      onToggle={handleToggle}
      className={className}
    />
  );
}
