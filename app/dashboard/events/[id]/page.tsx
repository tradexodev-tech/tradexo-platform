import EventManageView from "@/components/events/EventManageView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManageEventPage({ params }: PageProps) {
  const { id } = await params;
  return <EventManageView eventId={id} />;
}
