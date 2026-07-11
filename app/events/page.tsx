import type { Metadata } from "next";

import EventListView from "@/components/events/EventListView";
import Navbar from "@/components/landing/Navbar";
import { fetchPublicEvents } from "@/lib/events";
import { parseEventFilters } from "@/lib/events-public";

export const metadata: Metadata = {
  title: "Trade Events | Tradexo",
  description:
    "Discover global trade exhibitions, conferences, and networking events on Tradexo.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    industry?: string;
    country?: string;
    city?: string;
    sort?: string;
    timeframe?: string;
    page?: string;
  }>;
};

export default async function EventsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseEventFilters(resolvedSearchParams);
  const { data: events, count } = await fetchPublicEvents(filters);

  return (
    <>
      <Navbar />
      <EventListView initialEvents={events ?? []} initialCount={count} />
    </>
  );
}
