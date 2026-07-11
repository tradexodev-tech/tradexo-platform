import { Search } from "lucide-react";

import type { RFQStatus } from "@/types/rfq";
import { RFQ_STATUS_OPTIONS } from "@/types/rfq";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type RFQFiltersProps = {
  search: string;
  status: RFQStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: RFQStatus | "all") => void;
};

export default function RFQFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: RFQFiltersProps) {
  return (
    <div className="space-y-3 border-b pb-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search title, description, industry or country"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search RFQs"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as RFQStatus | "all")
          }
          className={`${selectClass} sm:max-w-xs`}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {RFQ_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
