import EventCreateForm from "@/components/events/EventCreateForm";

export default function CreateEventPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your trade event in six steps. Your progress is autosaved as a draft.
        </p>
      </div>
      <EventCreateForm />
    </div>
  );
}
