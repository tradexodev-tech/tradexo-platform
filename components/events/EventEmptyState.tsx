import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";

type EventEmptyStateProps = {
  title?: string;
  description?: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
};

export default function EventEmptyState({
  title = "No events found",
  description = "There are no trade events matching your criteria yet. Check back soon for upcoming global trade events.",
  showClearFilters = false,
  onClearFilters,
}: EventEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <CalendarDays className="size-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {showClearFilters && onClearFilters ? (
        <Button variant="outline" className="mt-6" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
