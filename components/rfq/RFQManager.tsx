"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import EmptyRFQState from "@/components/rfq/EmptyRFQState";
import RFQCard from "@/components/rfq/RFQCard";
import RFQFilters from "@/components/rfq/RFQFilters";
import RFQForm from "@/components/rfq/RFQForm";
import { Button } from "@/components/ui/button";
import { useRFQs } from "@/hooks/useRFQs";
import { cn } from "@/lib/utils";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function RFQLoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <SkeletonBlock className="h-8 w-28" />
        <SkeletonBlock className="mt-2 h-5 w-96 max-w-full" />
      </div>
      <SkeletonBlock className="h-10 w-full rounded-lg" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-3/4" />
            <SkeletonBlock className="mt-4 h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RFQDeleteDialog({
  open,
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 left-0 z-50 flex items-center justify-center p-4 md:left-64">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={deleting ? undefined : onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-rfq-title"
        className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-xl"
      >
        <h2
          id="delete-rfq-title"
          className="text-lg font-semibold text-foreground"
        >
          Delete draft RFQ?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">
            {title || "this RFQ"}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Deleting..." : "Delete RFQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RFQManager() {
  const {
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
  } = useRFQs();

  const showEmptyCatalog = !loading && totalCount === 0 && !hasActiveFilters && !loadError;
  const showNoResults = !loading && rfqs.length === 0 && hasActiveFilters && !loadError;
  const pageStart =
    totalCount === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const pageEnd = Math.min(filters.page * filters.pageSize, totalCount);

  if (loading) {
    return <RFQLoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">RFQs</h2>
          <p className="mt-1 text-muted-foreground">
            Create and manage requests for quotation as a buyer.
          </p>
        </div>
        {!showEmptyCatalog ? (
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create RFQ
          </Button>
        ) : null}
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}. Ensure the rfqs table exists in Supabase.
        </div>
      ) : null}

      {showEmptyCatalog ? (
        <EmptyRFQState onCreateRFQ={openCreateForm} />
      ) : (
        <>
          <RFQFilters
            search={searchInput}
            status={filters.status}
            onSearchChange={setSearchInput}
            onStatusChange={(status) => setFilters({ status })}
          />

          {showNoResults ? (
            <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">
                No RFQs found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <RFQCard
                  key={rfq.id}
                  rfq={rfq}
                  publishing={publishingId === rfq.id}
                  closing={closingId === rfq.id}
                  onEdit={openEditForm}
                  onPublish={(item) => void publishExistingRFQ(item.id)}
                  onClose={(item) => void closeExistingRFQ(item.id)}
                  onDelete={setDeleteTarget}
                />
              ))}

              {totalCount > 0 ? (
                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {pageStart}–{pageEnd} of {totalCount}
                  </p>
                  <nav
                    className="flex items-center gap-2"
                    aria-label="RFQ pagination"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters({ page: filters.page - 1 })}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <span className="px-2 text-sm text-muted-foreground">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={filters.page >= totalPages}
                      onClick={() => setFilters({ page: filters.page + 1 })}
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </nav>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {formOpen ? (
        <RFQForm
          key={editingRFQ?.id ?? "new"}
          rfq={editingRFQ}
          saving={saving}
          onClose={closeForm}
          onSaveDraft={async (input) => {
            await saveDraft(input);
          }}
          onPublish={async (input) => {
            await publishDraft(input);
          }}
        />
      ) : null}

      <RFQDeleteDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDeleteRFQ()}
      />

      {toast ? (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={cn(
            "fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
