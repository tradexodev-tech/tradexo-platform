import Navbar from "@/components/landing/Navbar";
import EventSkeleton from "@/components/events/EventSkeleton";

export default function EventsLoading() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-64 animate-pulse rounded bg-muted" />
        <EventSkeleton />
      </div>
    </>
  );
}
