"use client";

import { useParams } from "next/navigation";

import ProductDetailManager from "@/components/products/ProductDetailManager";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return <ProductDetailManager productId={productId} />;
}
