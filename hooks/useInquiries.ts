"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchSupplierInquiries,
  fetchSupplierInquiry,
  getInquiryCounts,
  replyToInquiry,
  updateInquiryStatus,
} from "@/lib/inquiries";
import type {
  Inquiry,
  InquiryCounts,
  InquiryFilters,
  InquiryStatus,
} from "@/types/inquiry";
import {
  DEFAULT_INQUIRY_FILTERS,
  EMPTY_INQUIRY_COUNTS,
  validateInquiryReply,
} from "@/types/inquiry";

export function useInquiries(initialFilters?: InquiryFilters) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<InquiryCounts>(EMPTY_INQUIRY_COUNTS);
  const [filters, setFiltersState] = useState<InquiryFilters>({
    ...DEFAULT_INQUIRY_FILTERS,
    ...initialFilters,
  });
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [drawerSuccess, setDrawerSuccess] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const markingAsReadRef = useRef<string | null>(null);

  const loadCounts = useCallback(async () => {
    setCountsLoading(true);

    const { data, error } = await getInquiryCounts();

    if (error) {
      setCounts(EMPTY_INQUIRY_COUNTS);
    } else {
      setCounts(data ?? EMPTY_INQUIRY_COUNTS);
    }

    setCountsLoading(false);
  }, []);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, count, error } = await fetchSupplierInquiries(filters);

    if (error) {
      setLoadError(error.message);
      setInquiries([]);
      setTotalCount(0);
    } else {
      setInquiries(data ?? []);
      setTotalCount(count);
    }

    setLoading(false);
  }, [filters]);

  const refreshInquiries = useCallback(async () => {
    const { data, count, error } = await fetchSupplierInquiries(filters);

    if (error) {
      return { error };
    }

    setInquiries(data ?? []);
    setTotalCount(count ?? 0);
    return { error: null };
  }, [filters]);

  const refreshCounts = useCallback(async () => {
    const { data, error } = await getInquiryCounts();

    if (error) {
      return { error };
    }

    setCounts(data ?? EMPTY_INQUIRY_COUNTS);
    return { error: null };
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const setFilters = useCallback((partial: Partial<InquiryFilters>) => {
    setFiltersState((previous) => ({
      ...previous,
      ...partial,
      page:
        partial.page ??
        (partial.search !== undefined ||
        partial.status !== undefined ||
        partial.sort !== undefined ||
        partial.pageSize !== undefined
          ? 1
          : previous.page),
    }));
  }, []);

  const [searchInput, setSearchInput] = useState(
    () => initialFilters?.search ?? ""
  );
  const appliedSearchRef = useRef(searchInput);

  const normalizedAppliedSearch = filters.search ?? "";

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

  async function openInquiry(id: string) {
    setActionMessage(null);
    setDrawerOpen(true);

    const { data, error } = await fetchSupplierInquiry(id);

    if (error) {
      setActionMessage(`Failed to load inquiry: ${error.message}`);
      setSelectedInquiry(null);
      return;
    }

    setSelectedInquiry(data);
  }

  async function openInquiryFromList(inquiry: Inquiry) {
    setDrawerError(null);
    setReplyError(null);
    setDrawerSuccess(null);
    setReplyDraft("");
    setActionMessage(null);
    setSelectedInquiry(inquiry);
    setDrawerOpen(true);

    if (inquiry.status !== "new") {
      return;
    }

    if (markingAsReadRef.current === inquiry.id) {
      return;
    }

    markingAsReadRef.current = inquiry.id;
    setUpdatingStatus(true);

    const { error } = await updateInquiryStatus(inquiry.id, "read");

    setUpdatingStatus(false);
    markingAsReadRef.current = null;

    if (error) {
      setDrawerError(`Failed to mark inquiry as read: ${error.message}`);
      return;
    }

    const readInquiry: Inquiry = { ...inquiry, status: "read" };

    setSelectedInquiry(readInquiry);
    setInquiries((previous) =>
      previous.map((item) =>
        item.id === inquiry.id ? { ...item, status: "read" } : item
      )
    );

    await Promise.all([refreshInquiries(), refreshCounts()]);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedInquiry(null);
    setDrawerError(null);
    setReplyError(null);
    setDrawerSuccess(null);
    setReplyDraft("");
  }

  async function sendReply() {
    if (!selectedInquiry || sendingReply) {
      return;
    }

    const validationError = validateInquiryReply(replyDraft);
    if (validationError) {
      setReplyError(validationError);
      setDrawerSuccess(null);
      return;
    }

    setSendingReply(true);
    setReplyError(null);
    setDrawerSuccess(null);

    const { data, error } = await replyToInquiry(
      selectedInquiry.id,
      replyDraft
    );

    setSendingReply(false);

    if (error) {
      setReplyError(`Failed to send reply: ${error.message}`);
      return;
    }

    if (data) {
      setSelectedInquiry(data);
      setInquiries((previous) =>
        previous.map((item) => (item.id === data.id ? data : item))
      );
      setReplyDraft("");
      setDrawerSuccess("Reply sent successfully.");
    }

    await Promise.all([refreshInquiries(), refreshCounts()]);
  }

  async function changeInquiryStatus(id: string, status: InquiryStatus) {
    setUpdatingStatus(true);
    setActionMessage(null);

    const { error } = await updateInquiryStatus(id, status);

    setUpdatingStatus(false);

    if (error) {
      setActionMessage(`Failed to update status: ${error.message}`);
      return false;
    }

    setActionMessage(`Inquiry marked as ${status}.`);
    await Promise.all([refreshInquiries(), refreshCounts()]);

    if (selectedInquiry?.id === id) {
      setSelectedInquiry((previous) =>
        previous ? { ...previous, status } : previous
      );
    }

    return true;
  }

  return {
    inquiries,
    totalCount,
    counts,
    filters,
    loading,
    countsLoading,
    loadError,
    actionMessage,
    drawerError,
    replyError,
    drawerSuccess,
    replyDraft,
    sendingReply,
    updatingStatus,
    drawerOpen,
    selectedInquiry,
    loadInquiries,
    loadCounts,
    setFilters,
    searchInput,
    setSearchInput,
    openInquiry,
    openInquiryFromList,
    closeDrawer,
    sendReply,
    setReplyDraft,
    changeInquiryStatus,
  };
}
