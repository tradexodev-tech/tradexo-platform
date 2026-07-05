"use client";

import { useMemo, useRef } from "react";
import { Eye } from "lucide-react";

import InquiryDetailsDrawer from "@/components/inquiries/InquiryDetailsDrawer";
import InquiryEmptyState from "@/components/inquiries/InquiryEmptyState";
import InquiryFiltersBar from "@/components/inquiries/InquiryFiltersBar";
import InquiryLoadingState from "@/components/inquiries/InquiryLoadingState";
import InquiryStatusBadge from "@/components/inquiries/InquiryStatusBadge";
import InquiryTable, {
  BuyerAvatar,
  formatSubmittedDate,
} from "@/components/inquiries/InquiryTable";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { buildInquiryTimeline } from "@/lib/inquiry-timeline";
import { useInquiries } from "@/hooks/useInquiries";
import type { Inquiry } from "@/types/inquiry";
function InquiryMobileCard({
  inquiry,
  onView,
}: {
  inquiry: Inquiry;
  onView: (inquiry: Inquiry, trigger?: HTMLElement) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-blue-200">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <BuyerAvatar name={inquiry.buyer_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {inquiry.buyer_name || "—"}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {inquiry.buyer_company || "—"}
            </p>
            <p className="mt-2 truncate text-sm text-foreground">
              {inquiry.product_name || "—"}
            </p>
          </div>
          <InquiryStatusBadge status={inquiry.status} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Submitted {formatSubmittedDate(inquiry.created_at)}
        </p>
      </div>
      <div className="border-t bg-muted/20 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(event) => onView(inquiry, event.currentTarget)}
        >
          <Eye className="size-3.5" />
          View
        </Button>
      </div>
    </article>
  );
}

export default function InquiriesManager() {
  const viewTriggerRef = useRef<HTMLElement | null>(null);

  const {
    inquiries,
    counts,
    filters,
    loading,
    countsLoading,
    loadError,
    actionMessage,
    setFilters,
    searchInput,
    setSearchInput,
    drawerOpen,
    selectedInquiry,
    drawerError,
    replyError,
    drawerSuccess,
    replyDraft,
    sendingReply,
    openInquiryFromList,
    closeDrawer,
    sendReply,
    setReplyDraft,
  } = useInquiries();

  function handleView(inquiry: Inquiry, trigger?: HTMLElement) {
    if (trigger) {
      viewTriggerRef.current = trigger;
    }
    openInquiryFromList(inquiry);
  }

  const timelineEvents = useMemo(
    () => (selectedInquiry ? buildInquiryTimeline(selectedInquiry) : []),
    [selectedInquiry]
  );

  if (loading) {
    return <InquiryLoadingState />;
  }

  const showEmptyCatalog = counts.total === 0 && !loadError;
  const showNoResults =
    !showEmptyCatalog && inquiries.length === 0 && counts.total > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inquiries</h2>
        <p className="mt-1 text-muted-foreground">
          Manage buyer inquiries received through Tradexo.
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}. Ensure the inquiries table exists in Supabase.
        </div>
      )}

      {actionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total"
          value={countsLoading ? "—" : String(counts.total)}
        />
        <StatCard
          title="New"
          value={countsLoading ? "—" : String(counts.new)}
        />
        <StatCard
          title="Read"
          value={countsLoading ? "—" : String(counts.read)}
        />
        <StatCard
          title="Replied"
          value={countsLoading ? "—" : String(counts.replied)}
        />
        <StatCard
          title="Closed"
          value={countsLoading ? "—" : String(counts.closed)}
        />
      </div>

      {!showEmptyCatalog && (
        <InquiryFiltersBar
          search={searchInput}
          status={filters.status ?? "all"}
          sort={filters.sort ?? "newest"}
          onSearchChange={setSearchInput}
          onStatusChange={(status) => setFilters({ status })}
          onSortChange={(sort) => setFilters({ sort })}
        />
      )}

      {showEmptyCatalog ? (
        <InquiryEmptyState />
      ) : showNoResults ? (
        <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-foreground">
            No inquiries found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <InquiryTable
            inquiries={inquiries}
            onView={handleView}
          />
          <div className="space-y-4 md:hidden">
            {inquiries.map((inquiry) => (
              <InquiryMobileCard
                key={inquiry.id}
                inquiry={inquiry}
                onView={handleView}
              />
            ))}
          </div>
        </>
      )}

      <InquiryDetailsDrawer
        open={drawerOpen}
        inquiry={selectedInquiry}
        onClose={closeDrawer}
        triggerRef={viewTriggerRef}
        error={drawerError}
        replyMessage={replyDraft}
        onReplyMessageChange={setReplyDraft}
        onSendReply={sendReply}
        sendingReply={sendingReply}
        replyError={replyError}
        successMessage={drawerSuccess}
        timelineEvents={timelineEvents}
      />
    </div>
  );
}
