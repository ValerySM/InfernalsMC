import { getEventsByCategory } from "@/data/events";
import { EventsIndexPage } from "@/pages/_EventsIndex";

export default function Events() {
  return (
    <EventsIndexPage
      title="Events"
      subtitle="Our club events in a calendar view. Click a date to open event pages with photos and videos."
      events={getEventsByCategory("event")}
    />
  );
}
