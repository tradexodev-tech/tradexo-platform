import { FileSearch } from "lucide-react";

type RFQEmptyStateProps = {
  onClearFilters?: () => void;
  showClearFilters?: boolean;
};

export default function RFQEmptyState({
  onClearFilters,
  showClearFilters = false,
}: RFQEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileSearch className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No public RFQs available.
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {showClearFilters
          ? "Try adjusting your search or filters to find open buyer requests."
          : "Check back later for new buyer sourcing opportunities."}
      </p>
      {showClearFilters && onClearFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
