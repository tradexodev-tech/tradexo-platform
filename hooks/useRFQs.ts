"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  closeRFQ,
  createRFQ,
  deleteRFQ,
  fetchBuyerRFQs,
  publishRFQ,
  updateRFQ,
} from "@/lib/rfq";
import type { CreateRFQInput, RFQ, RFQStatus, UpdateRFQInput } from "@/types/rfq";
import { validateCreateRFQInput } from "@/types/rfq";

export const RFQ_PAGE_SIZE = 10;

export type RFQFilters = {
  search: string;
  status: RFQStatus | "all";
  page: number;
  pageSize: number;
};

export const DEFAULT_RFQ_FILTERS: RFQFilters = {
  search: "",
  status: "all",
  page: 1,
  pageSize: RFQ_PAGE_SIZE,
};

type RFQToast = {
  type: "success" | "error";
  message: string;
};

function matchesRFQSearch(rfq: RFQ, search: string) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    rfq.title.toLowerCase().includes(query) ||
    rfq.description.toLowerCase().includes(query) ||
    (rfq.industry?.toLowerCase().includes(query) ?? false) ||
    (rfq.industry_category?.toLowerCase().includes(query) ?? false) ||
    rfq.delivery_country.toLowerCase().includes(query)
  );
}

export function useRFQs(initialFilters?: Partial<RFQFilters>) {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<RFQFilters>({
    ...DEFAULT_RFQ_FILTERS,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<RFQToast | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState<RFQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RFQ | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(
    () => initialFilters?.search ?? ""
  );
  const appliedSearchRef = useRef(searchInput);

  const normalizedAppliedSearch = filters.search;

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  const showToast = useCallback((type: RFQToast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const setFilters = useCallback((partial: Partial<RFQFilters>) => {
    setFiltersState((previous) => ({
      ...previous,
      ...partial,
      page:
        partial.page ??
        (partial.search !== undefined || partial.status !== undefined
          ? 1
          : previous.page),
    }));
  }, []);

  useEffect(() => {
    appliedSearchRef.current = normalizedAppliedSearch;
  }, [normalizedAppliedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== appliedSearchRef.current) {
        setFilters({ search: searchInput });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setFilters]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setLoadError(null);

      const hasSearch = Boolean(filters.search.trim());
      const { data, count, error } = await fetchBuyerRFQs({
        status: filters.status,
        page: hasSearch ? 1 : filters.page,
        pageSize: hasSearch ? 500 : filters.pageSize,
      });

      if (cancelled) {
        return;
      }

      if (error) {
        setLoadError(error.message);
        setRfqs([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      const allRfqs = data ?? [];

      if (hasSearch) {
        const filtered = allRfqs.filter((rfq) =>
          matchesRFQSearch(rfq, filters.search)
        );
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize;

        setRfqs(filtered.slice(from, to));
        setTotalCount(filtered.length);
      } else {
        setRfqs(allRfqs);
        setTotalCount(count ?? 0);
      }

      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const hasActiveFilters = useMemo(
    () => filters.search.trim().length > 0 || filters.status !== "all",
    [filters.search, filters.status]
  );

  const openCreateForm = useCallback(() => {
    setEditingRFQ(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((rfq: RFQ) => {
    setEditingRFQ(rfq);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingRFQ(null);
  }, []);

  const refreshRFQs = useCallback(async () => {
    const hasSearch = Boolean(filters.search.trim());
    const { data, count, error } = await fetchBuyerRFQs({
      status: filters.status,
      page: hasSearch ? 1 : filters.page,
      pageSize: hasSearch ? 500 : filters.pageSize,
    });

    if (error) {
      return { error };
    }

    const allRfqs = data ?? [];

    if (hasSearch) {
      const filtered = allRfqs.filter((rfq) =>
        matchesRFQSearch(rfq, filters.search)
      );
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize;

      setRfqs(filtered.slice(from, to));
      setTotalCount(filtered.length);
    } else {
      setRfqs(allRfqs);
      setTotalCount(count ?? 0);
    }

    return { error: null };
  }, [filters]);

  const saveDraft = useCallback(
    async (input: CreateRFQInput) => {
      const validationError = validateCreateRFQInput(input);

      if (validationError) {
        showToast("error", validationError);
        return { error: { message: validationError } };
      }

      setSaving(true);

      if (editingRFQ) {
        const updateInput: UpdateRFQInput = input;
        const { data, error } = await updateRFQ(editingRFQ.id, updateInput);

        setSaving(false);

        if (error) {
          showToast("error", error.message ?? "Failed to save RFQ draft.");
          return { error };
        }

        showToast("success", "RFQ draft saved.");
        closeForm();
        await refreshRFQs();
        return { data, error: null };
      }

      const { data, error } = await createRFQ(input);

      setSaving(false);

      if (error) {
        showToast("error", error.message ?? "Failed to create RFQ draft.");
        return { error };
      }

      showToast("success", "RFQ draft created.");
      closeForm();
      await refreshRFQs();
      return { data, error: null };
    },
    [closeForm, editingRFQ, refreshRFQs, showToast]
  );

  const publishDraft = useCallback(
    async (input: CreateRFQInput) => {
      const validationError = validateCreateRFQInput(input);

      if (validationError) {
        showToast("error", validationError);
        return { error: { message: validationError } };
      }

      setSaving(true);

      if (editingRFQ) {
        const { error: updateError } = await updateRFQ(editingRFQ.id, input);

        if (updateError) {
          setSaving(false);
          showToast("error", updateError.message ?? "Failed to update RFQ.");
          return { error: updateError };
        }

        const { data, error } = await publishRFQ(editingRFQ.id);

        setSaving(false);

        if (error) {
          showToast("error", error.message ?? "Failed to publish RFQ.");
          return { error };
        }

        showToast("success", "RFQ published.");
        closeForm();
        await refreshRFQs();
        return { data, error: null };
      }

      const { data: created, error: createError } = await createRFQ(input);

      if (createError || !created) {
        setSaving(false);
        showToast("error", createError?.message ?? "Failed to create RFQ.");
        return { error: createError };
      }

      const { data, error } = await publishRFQ(created.id);

      setSaving(false);

      if (error) {
        showToast("error", error.message ?? "Failed to publish RFQ.");
        return { error };
      }

      showToast("success", "RFQ published.");
      closeForm();
      await refreshRFQs();
      return { data, error: null };
    },
    [closeForm, editingRFQ, refreshRFQs, showToast]
  );

  const publishExistingRFQ = useCallback(
    async (id: string) => {
      setPublishingId(id);

      const { data, error } = await publishRFQ(id);

      setPublishingId(null);

      if (error) {
        showToast("error", error.message ?? "Failed to publish RFQ.");
        return { error };
      }

      showToast("success", "RFQ published.");
      await refreshRFQs();
      return { data, error: null };
    },
    [refreshRFQs, showToast]
  );

  const closeExistingRFQ = useCallback(
    async (id: string) => {
      setClosingId(id);

      const { data, error } = await closeRFQ(id);

      setClosingId(null);

      if (error) {
        showToast("error", error.message ?? "Failed to close RFQ.");
        return { error };
      }

      showToast("success", "RFQ closed.");
      await refreshRFQs();
      return { data, error: null };
    },
    [refreshRFQs, showToast]
  );

  const confirmDeleteRFQ = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    const result = await deleteRFQ(deleteTarget.id);

    setDeleting(false);

    if (result.error) {
      showToast("error", result.error.message ?? "Failed to delete RFQ.");
      return;
    }

    showToast("success", "RFQ deleted.");
    setDeleteTarget(null);
    await refreshRFQs();
  }, [deleteTarget, refreshRFQs, showToast]);

  return {
    rfqs,
    totalCount,
    totalPages,
    filters,
    loading,
    loadError,
    toast,
    formOpen,
    editingRFQ,
    saving,
    publishingId,
    closingId,
    deleteTarget,
    deleting,
    searchInput,
    hasActiveFilters,
    setSearchInput,
    setFilters,
    setDeleteTarget,
    openCreateForm,
    openEditForm,
    closeForm,
    saveDraft,
    publishDraft,
    publishExistingRFQ,
    closeExistingRFQ,
    confirmDeleteRFQ,
    refreshRFQs,
  };
}
