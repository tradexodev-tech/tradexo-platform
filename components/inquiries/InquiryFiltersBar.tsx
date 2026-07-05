import { Search } from "lucide-react";

import type { InquirySort, InquiryStatus } from "@/types/inquiry";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type InquiryFiltersBarProps = {
  search: string;
  status: InquiryStatus | "all";
  sort: InquirySort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InquiryStatus | "all") => void;
  onSortChange: (value: InquirySort) => void;
};

export default function InquiryFiltersBar({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: InquiryFiltersBarProps) {
  return (
    <div className="space-y-3 border-b pb-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search buyer, email, company or product"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as InquiryStatus | "all")
          }
          className={`${selectClass} sm:flex-1`}
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as InquirySort)}
          className={`${selectClass} sm:flex-1`}
          aria-label="Sort inquiries"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
