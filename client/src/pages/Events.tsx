import { EventsIndexPage } from "@/pages/_EventsIndex";
import { PageHeader } from "@/components/site/PageHeader";
import { usePublicEvents, useSiteContent } from "@/hooks/usePublicContent";

export default function Events() {
  const { events, loading, error } = usePublicEvents("event");
  const { get } = useSiteContent();

  const title = get("events_page_title", "Events");
  const subtitle = get("events_page_subtitle", "Our club events in a calendar view. Click a date to open event pages with photos and videos.");
  const emptyText = get("events_empty_text", "No events match the current filters.");

  if (loading) {
    return (
      <div>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="container mx-auto px-4 pb-16">
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="container mx-auto px-4 pb-16">
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-6 text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <EventsIndexPage
      title={title}
      subtitle={subtitle}
      events={events}
      emptyText={emptyText}
    />
  );
}
