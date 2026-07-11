import type { Metadata } from "next";
import { notFound } from "next/navigation";

import EventDetailView from "@/components/events/EventDetailView";
import Navbar from "@/components/landing/Navbar";
import { getServerProfile } from "@/lib/auth-server";
import { fetchPublishedEventBySlug, fetchRelatedEvents } from "@/lib/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: event } = await fetchPublishedEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | Tradexo" };
  }

  return {
    title: `${event.title} | Tradexo Events`,
    description: event.short_description ?? event.description ?? undefined,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ data: event, error }, profileResult] = await Promise.all([
    fetchPublishedEventBySlug(slug),
    getServerProfile(),
  ]);

  if (error || !event) {
    notFound();
  }

  const { data: relatedEvents } = await fetchRelatedEvents(event);

  return (
    <>
      <Navbar />
      <EventDetailView
        event={event}
        relatedEvents={relatedEvents ?? []}
        isAuthenticated={Boolean(profileResult.data)}
      />
    </>
  );
}
