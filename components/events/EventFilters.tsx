"use client";

import { Search } from "lucide-react";

import type { PublicEventFilters } from "@/hooks/usePublicEvents";
import { COMPANY_INDUSTRIES, PRODUCT_COUNTRIES } from "@/lib/catalog";
import { EVENT_SORT_OPTIONS } from "@/types/event";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type EventFiltersProps = {
  search: string;
  filters: PublicEventFilters;
  onSearchChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onTimeframeChange: (value: PublicEventFilters["timeframe"]) => void;
  onSortChange: (value: PublicEventFilters["sort"]) => void;
};

export default function EventFilters({
  search,
  filters,
  onSearchChange,
  onIndustryChange,
  onCountryChange,
  onTimeframeChange,
  onSortChange,
}: EventFiltersProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search events…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={inputClass + " pl-9"}
          />
        </div>

        <select
          value={filters.industry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className={inputClass}
          aria-label="Filter by industry"
        >
          <option value="">All industries</option>
          {COMPANY_INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <select
          value={filters.country}
          onChange={(e) => onCountryChange(e.target.value)}
          className={inputClass}
          aria-label="Filter by country"
        >
          <option value="">All countries</option>
          {PRODUCT_COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filters.timeframe}
          onChange={(e) =>
            onTimeframeChange(e.target.value as PublicEventFilters["timeframe"])
          }
          className={inputClass}
          aria-label="Filter by timeframe"
        >
          <option value="all">All events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="featured">Featured</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onSortChange(e.target.value as PublicEventFilters["sort"])}
          className={inputClass}
          aria-label="Sort events"
        >
          {EVENT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function OrganizerEventFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search your events…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={inputClass + " pl-9"}
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={inputClass + " sm:w-48"}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
