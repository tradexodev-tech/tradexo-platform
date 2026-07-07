import { Search } from "lucide-react";

import {
  NOTIFICATION_TYPE_FILTER_OPTIONS,
  type NotificationDateRangeFilter,
  type NotificationHistorySort,
  type NotificationReadFilter,
  type NotificationTypeFilter,
} from "@/lib/notification-history";

const selectClass =
  "rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

type NotificationHistoryFiltersProps = {
  search: string;
  read: NotificationReadFilter;
  type: NotificationTypeFilter;
  dateRange: NotificationDateRangeFilter;
  sort: NotificationHistorySort;
  onSearchChange: (value: string) => void;
  onReadChange: (value: NotificationReadFilter) => void;
  onTypeChange: (value: NotificationTypeFilter) => void;
  onDateRangeChange: (value: NotificationDateRangeFilter) => void;
  onSortChange: (value: NotificationHistorySort) => void;
};

export default function NotificationHistoryFilters({
  search,
  read,
  type,
  dateRange,
  sort,
  onSearchChange,
  onReadChange,
  onTypeChange,
  onDateRangeChange,
  onSortChange,
}: NotificationHistoryFiltersProps) {
  return (
    <div className="space-y-3 border-b pb-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search title or message"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search notifications"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={read}
          onChange={(event) =>
            onReadChange(event.target.value as NotificationReadFilter)
          }
          className={selectClass}
          aria-label="Filter by read status"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        <select
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value as NotificationTypeFilter)
          }
          className={selectClass}
          aria-label="Filter by notification type"
        >
          {NOTIFICATION_TYPE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={dateRange}
          onChange={(event) =>
            onDateRangeChange(event.target.value as NotificationDateRangeFilter)
          }
          className={selectClass}
          aria-label="Filter by date range"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as NotificationHistorySort)
          }
          className={selectClass}
          aria-label="Sort notifications"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
