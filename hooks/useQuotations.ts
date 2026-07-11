"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchSupplierQuotations,
  submitQuotation,
  updateQuotation,
  withdrawQuotation,
} from "@/lib/quotation";
import type {
  QuotationWithRFQ,
  SubmitQuotationInput,
  UpdateQuotationInput,
} from "@/types/quotation";

type QuotationToast = {
  type: "success" | "error";
  message: string;
};

export function useQuotations() {
  const [quotations, setQuotations] = useState<QuotationWithRFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<QuotationToast | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] =
    useState<QuotationWithRFQ | null>(null);

  const showToast = useCallback((type: QuotationToast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const loadQuotations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await fetchSupplierQuotations();

    if (error) {
      setLoadError(error.message);
      setQuotations([]);
    } else {
      setQuotations(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await fetchSupplierQuotations();

      if (cancelled) {
        return;
      }

      if (error) {
        setLoadError(error.message);
        setQuotations([]);
      } else {
        setQuotations(data ?? []);
      }

      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateForm = useCallback(() => {
    setEditingQuotation(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((quotation: QuotationWithRFQ) => {
    setEditingQuotation(quotation);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingQuotation(null);
  }, []);

  const handleSubmit = useCallback(
    async (input: SubmitQuotationInput) => {
      setSubmitting(true);

      const { data, error } = await submitQuotation(input);

      setSubmitting(false);

      if (error) {
        showToast("error", error.message ?? "Failed to submit quotation.");
        return { error };
      }

      showToast("success", "Quotation submitted successfully.");
      closeForm();
      await loadQuotations();
      return { data, error: null };
    },
    [closeForm, loadQuotations, showToast]
  );

  const handleUpdate = useCallback(
    async (id: string, input: UpdateQuotationInput) => {
      setSubmitting(true);

      const { data, error } = await updateQuotation(id, input);

      setSubmitting(false);

      if (error) {
        showToast("error", error.message ?? "Failed to update quotation.");
        return { error };
      }

      showToast("success", "Quotation updated successfully.");
      closeForm();
      await loadQuotations();
      return { data, error: null };
    },
    [closeForm, loadQuotations, showToast]
  );

  const handleWithdraw = useCallback(
    async (id: string) => {
      setWithdrawingId(id);

      const { error } = await withdrawQuotation(id);

      setWithdrawingId(null);

      if (error) {
        showToast("error", error.message ?? "Failed to withdraw quotation.");
        return { error };
      }

      showToast("success", "Quotation withdrawn.");
      await loadQuotations();
      return { error: null };
    },
    [loadQuotations, showToast]
  );

  return {
    quotations,
    loading,
    loadError,
    toast,
    submitting,
    withdrawingId,
    formOpen,
    editingQuotation,
    openCreateForm,
    openEditForm,
    closeForm,
    handleSubmit,
    handleUpdate,
    handleWithdraw,
    refreshQuotations: loadQuotations,
  };
}
