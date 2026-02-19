import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type ClubEvent,
  formatEventDate,
  formatEventTime,
  getEventHref,
} from "@/data/events";

export function EventCard({
  event,
  className,
}: {
  event: ClubEvent;
  className?: string;
}) {
  return (
    <Link
      href={getEventHref(event)}
      className={cn(
        "block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors",
        className
      )}
    >
      {event.cover ? (
        <img
          src={event.cover}
          alt={event.title}
          className="w-full h-56 object-cover border-b-2 border-gray-700"
          loading="lazy"
        />
      ) : null}

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-300 text-sm">
          <span className="font-heading uppercase text-red-500">
            {formatEventDate(event)}
          </span>
          {event.time ? <span>{formatEventTime(event)}</span> : null}
          {event.location ? <span className="text-gray-400">• {event.location}</span> : null}
        </div>

        <h3 className="mt-2 font-heading uppercase text-xl text-white">
          {event.title}
        </h3>
        <p className="mt-2 text-gray-300 leading-relaxed">{event.shortDescription}</p>

        {event.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.slice(0, 6).map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="border-gray-700 text-gray-200 uppercase tracking-wide"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
