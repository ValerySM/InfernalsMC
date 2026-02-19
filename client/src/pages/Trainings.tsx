import { getEventsByCategory } from "@/data/events";
import { EventsIndexPage } from "@/pages/_EventsIndex";

export default function Trainings() {
  return (
    <EventsIndexPage
      title="Trainings"
      subtitle="Training events only. Same flow as events — calendar, tags, and detailed pages."
      events={getEventsByCategory("training")}
      emptyText="No trainings match the current filters."
    />
  );
}
