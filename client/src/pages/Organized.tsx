import { getEventsByCategory } from "@/data/events";
import { EventsIndexPage } from "@/pages/_EventsIndex";

export default function Organized() {
  return (
    <EventsIndexPage
      title="Organized Events"
      subtitle="Concerts, exhibitions and other events we helped organize."
      events={getEventsByCategory("organized")}
      emptyText="No organized events match the current filters."
    />
  );
}
