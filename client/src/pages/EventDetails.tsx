import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "@/components/site/MediaGallery";
import { PageHeader } from "@/components/site/PageHeader";
import {
  formatEventDate,
  formatEventTime,
  getEventBySlug,
  getEventHref,
  type ClubEvent,
} from "@/data/events";

function backHref(event: ClubEvent) {
  if (event.category === "training") return "/trainings";
  if (event.category === "organized") return "/organized";
  return "/events";
}

function backLabel(event: ClubEvent) {
  if (event.category === "training") return "Back to Trainings";
  if (event.category === "organized") return "Back to Organized Events";
  return "Back to Events";
}

export default function EventDetails({ slug }: { slug: string }) {
  const event = getEventBySlug(slug);

  if (!event) {
    return (
      <div>
        <PageHeader title="Event Not Found" subtitle="This event does not exist." />
        <div className="container mx-auto px-4 pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            <ArrowLeft className="size-4" /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={event.title} subtitle={event.shortDescription}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={backHref(event)}
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            <ArrowLeft className="size-4" /> {backLabel(event)}
          </Link>
          {event.externalUrl ? (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
            >
              Event Link <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-16">
        {/* Hero */}
        {event.cover ? (
          <div className="border-4 border-gray-700 bg-black/30 overflow-hidden">
            <img
              src={event.cover}
              alt={event.title}
              className="w-full max-h-[520px] object-cover"
            />
          </div>
        ) : null}

        <div className="mt-8 border-2 border-gray-700 bg-black/30 p-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-300">
            <span className="font-heading uppercase text-red-500">
              {formatEventDate(event)}
            </span>
            {event.time ? <span>{formatEventTime(event)}</span> : null}
            {event.location ? (
              <span className="text-gray-400">• {event.location}</span>
            ) : null}
            <span className="text-gray-500">•</span>
            <Link
              href={getEventHref(event)}
              className="underline decoration-red-500/40 hover:decoration-red-500 text-gray-200"
            >
              Share link
            </Link>
          </div>

          {event.tags?.length ? (
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {event.tags.map(t => (
                <Badge
                  key={t}
                  variant="outline"
                  className="border-gray-700 text-gray-200 uppercase tracking-wide"
                >
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-6 max-w-4xl mx-auto">
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-10">
          <h2 className="font-heading uppercase text-2xl text-red-500 text-center mb-6">
            Photos & Videos
          </h2>
          <MediaGallery media={event.media} />
        </div>
      </div>
    </div>
  );
}
