"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  fetchProduct,
  fetchProducts,
  getCurrentUserId,
  updateProduct,
} from "@/lib/products";
import type { Product, ProductFormInput, ProductStatus } from "@/types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { userId: uid, error: authError } = await getCurrentUserId();
    if (authError || !uid) {
      setLoadError(authError?.message ?? "User not authenticated");
      setProducts([]);
      setUserId(null);
      setLoading(false);
      return;
    }

    setUserId(uid);

    const { data, error } = await fetchProducts();
    if (error) {
      setLoadError(error.message);
      setProducts([]);
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openAddDrawer() {
    setEditingProduct(null);
    setActionMessage(null);
    setDrawerOpen(true);
  }

  async function openEditDrawer(product: Product) {
    setActionMessage(null);
    setDrawerOpen(true);

    const { data, error } = await fetchProduct(product.id);
    if (error || !data) {
      setEditingProduct(product);
      return;
    }

    setEditingProduct(data);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingProduct(null);
  }

  async function saveWithStatus(input: ProductFormInput, status: ProductStatus) {
    if (editingProduct) {
      const { error } = await updateProduct(editingProduct.id, input, status);
      if (error) throw new Error(error.message);
      setActionMessage(`Product saved as ${status.replace("_", " ")}.`);
    } else {
      const { error } = await createProduct(input, status);
      if (error) throw new Error(error.message);
      setActionMessage(`Product created as ${status.replace("_", " ")}.`);
    }
    await loadProducts();
  }

  async function saveDraft(input: ProductFormInput) {
    await saveWithStatus(input, "draft");
  }

  async function publishProduct(input: ProductFormInput) {
    await saveWithStatus(input, "published");
  }

  async function removeProduct(product: Product) {
    const { error } = await deleteProduct(product.id);
    if (error) {
      setActionMessage(`Failed to delete: ${error.message}`);
      return false;
    }
    setActionMessage(`"${product.product_name}" deleted.`);
    await loadProducts();
    return true;
  }

  return {
    products,
    userId,
    loading,
    loadError,
    actionMessage,
    drawerOpen,
    editingProduct,
    openAddDrawer,
    openEditDrawer,
    closeDrawer,
    saveDraft,
    publishProduct,
    removeProduct,
  };
}
