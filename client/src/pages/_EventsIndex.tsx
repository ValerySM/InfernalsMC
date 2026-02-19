import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { EventCard } from "@/components/site/EventCard";
import { TagCloud } from "@/components/site/TagCloud";
import { type ClubEvent, dateKey, sortByDateAsc } from "@/data/events";

function uniqTags(events: ClubEvent[]) {
  const freq = new Map<string, number>();
  for (const e of events) {
    for (const t of e.tags || []) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

function formatPickedDay(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function buildDateIndex(events: ClubEvent[]) {
  const map = new Map<string, ClubEvent[]>();
  for (const e of events) {
    const key = e.date;
    const list = map.get(key) || [];
    list.push(e);
    map.set(key, list);
  }
  for (const [_k, list] of map.entries()) list.sort(sortByDateAsc);
  return map;
}

export function EventsIndexPage({
  title,
  subtitle,
  events,
  emptyText = "No events match the current filters.",
}: {
  title: string;
  subtitle: string;
  events: ClubEvent[];
  emptyText?: string;
}) {
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(
    undefined
  );

  const tags = React.useMemo(() => uniqTags(events), [events]);

  const filtered = React.useMemo(() => {
    if (!selectedTags.length) return events;
    // OR logic: match any selected tag
    return events.filter(e => e.tags.some(t => selectedTags.includes(t)));
  }, [events, selectedTags]);

  const dateIndex = React.useMemo(() => buildDateIndex(filtered), [filtered]);

  const selectedKey = selectedDay ? dateKey(selectedDay) : "";
  const selectedEvents = selectedKey ? dateIndex.get(selectedKey) || [] : [];

  const allByDate = React.useMemo(() => {
    return [...filtered].sort(sortByDateAsc);
  }, [filtered]);

  const eventDays = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of filtered) set.add(e.date);
    return set;
  }, [filtered]);

  const onToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  const clearDay = () => setSelectedDay(undefined);

  const list = selectedDay ? selectedEvents : allByDate;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="container mx-auto px-4 pb-16">
        {tags.length ? (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="font-heading uppercase text-gray-300">
                Filter by tags
              </span>
              {selectedTags.length ? (
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:bg-black/40"
                  onClick={clearTags}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            <TagCloud tags={tags} selected={selectedTags} onToggle={onToggleTag} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="border-2 border-gray-700 bg-black/30">
            <div className="p-4 border-b border-gray-800">
              <p className="font-heading uppercase text-gray-300">
                Scroll the calendar and pick a date
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Highlighted days contain events.
              </p>
            </div>
            <div className="max-h-[560px] overflow-y-auto p-2">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                numberOfMonths={8}
                pagedNavigation={false}
                classNames={{
                  months: "flex flex-col gap-6",
                }}
                modifiers={{
                  hasEvent: date => eventDays.has(dateKey(date)),
                }}
                modifiersClassNames={{
                  hasEvent:
                    "ring-2 ring-red-500/30 rounded-md data-[selected-single=true]:ring-red-500/60",
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <h2 className="font-heading uppercase text-2xl text-white">
                  {selectedDay
                    ? `Selected: ${formatPickedDay(selectedDay)}`
                    : title}
                </h2>
                {selectedDay ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 text-gray-200 hover:bg-black/40"
                    onClick={clearDay}
                  >
                    Show all
                  </Button>
                ) : null}
              </div>
              <p className="text-gray-500 text-sm">
                Showing {filtered.length} item{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              {list.length ? (
                list.map(e => <EventCard key={e.id} event={e} />)
              ) : (
                <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300">
                  {emptyText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
