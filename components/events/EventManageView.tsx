"use client";

import EventControlCenter from "@/components/events/EventControlCenter";

type EventManageViewProps = {
  eventId: string;
};

export default function EventManageView({ eventId }: EventManageViewProps) {
  return <EventControlCenter eventId={eventId} />;
}
