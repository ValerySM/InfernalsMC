import { EventsIndexPage } from "@/pages/_EventsIndex";
import { PageHeader } from "@/components/site/PageHeader";
import { usePublicEvents, useSiteContent } from "@/hooks/usePublicContent";

export default function Trainings() {
  const { events, loading, error } = usePublicEvents("training");
  const { get } = useSiteContent();

  const title = get("trainings_page_title", "Trainings");
  const subtitle = get("trainings_page_subtitle", "Training events only. Same flow as events — calendar, tags, and detailed pages.");
  const emptyText = get("trainings_empty_text", "No trainings match the current filters.");

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
