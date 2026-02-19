import { cdnUrls } from "@/site/content";

export type EventCategory = "event" | "training" | "organized";

export type EventMedia =
  | {
      type: "image";
      url: string;
      alt?: string;
    }
  | {
      /** YouTube/Vimeo/etc embed URL. */
      type: "embed";
      url: string;
      title?: string;
    }
  | {
      /** Direct mp4/webm URL. */
      type: "video";
      url: string;
      title?: string;
    };

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD) in local time. */
  date: string;
  /** HH:mm (optional). */
  time?: string;
  location?: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  tags: string[];
  cover?: string;
  media?: EventMedia[];
  /** Optional external page (ticketing, FB event, etc.). */
  externalUrl?: string;
}

/**
 * Content source for events.
 * Add new items here as events happen (photos/videos/description).
 */
export const EVENTS: ClubEvent[] = [
  {
    id: "evt-2026-02-training-safety",
    slug: "training-safety-session-feb-2026",
    title: "Safety Training Session",
    date: "2026-02-22",
    time: "10:00",
    location: "Rishon LeZion",
    shortDescription:
      "Guided low-speed maneuvers, braking drills, and riding confidence boost.",
    description:
      "A focused training meetup for riders who want to sharpen control at low speeds and improve safety habits. We'll cover body position, smooth throttle, emergency braking, and controlled turns in a friendly club atmosphere.",
    category: "training",
    tags: ["training", "safety", "beginners"],
    cover: cdnUrls.gallery1,
    media: [
      { type: "image", url: cdnUrls.gallery1, alt: "Training warm-up" },
      { type: "image", url: cdnUrls.gallery2, alt: "Drill practice" },
    ],
  },
  {
    id: "evt-2026-03-ride-north",
    slug: "ride-to-the-north-march-2026",
    title: "Ride to the North",
    date: "2026-03-15",
    time: "08:30",
    location: "Meetup: Rishon LeZion",
    shortDescription:
      "Full-day club ride with scenic stops and a brotherhood lunch break.",
    description:
      "We start early, ride together in formation, stop for coffee, then hit the scenic routes. Final stop includes a shared meal and photos. Bring water, protective gear, and a full tank.",
    category: "event",
    tags: ["ride", "open", "scenic"],
    cover: cdnUrls.gallery3,
    media: [
      { type: "image", url: cdnUrls.gallery3, alt: "Road ride" },
      { type: "image", url: cdnUrls.gallery2, alt: "Group photo" },
    ],
  },
  {
    id: "evt-2026-01-new-year-party",
    slug: "new-year-party-2026",
    title: "Happy New Year Party",
    date: "2026-01-01",
    time: "21:00",
    location: "Club spot (Rishon LeZion)",
    shortDescription:
      "New year, new rides. Music, friends, and memories.",
    description:
      "A warm, loud, and friendly night with our people. This page is the place to upload photos/videos as they come in — keep the story alive.",
    category: "event",
    tags: ["party", "club", "night"],
    cover: cdnUrls.gallery2,
    media: [
      { type: "image", url: cdnUrls.gallery2, alt: "Party vibes" },
      { type: "image", url: cdnUrls.gallery1, alt: "Friends" },
      // Add video links here as they appear:
      // { type: "embed", url: "https://www.youtube.com/embed/VIDEO_ID", title: "Aftermovie" },
    ],
  },
  {
    id: "evt-2025-11-exhibition",
    slug: "custom-bike-exhibition-2025",
    title: "Custom Bike Exhibition",
    date: "2025-11-20",
    time: "19:00",
    location: "Tel Aviv",
    shortDescription:
      "An organized event featuring custom builds, art, and community.",
    description:
      "An exhibition night we helped organize — builds, art pieces, and community meetups. Add photos and videos from the event to showcase the atmosphere.",
    category: "organized",
    tags: ["organized", "exhibition", "community"],
    cover: cdnUrls.artStudioHero,
    media: [
      { type: "image", url: cdnUrls.artStudioHero, alt: "Exhibition preview" },
      { type: "image", url: cdnUrls.gallery3, alt: "Custom build" },
    ],
  },
];

function toEventDate(event: ClubEvent): Date {
  const time = event.time?.trim() || "00:00";
  // Local time parsing (no timezone suffix).
  return new Date(`${event.date}T${time}:00`);
}

export function sortByDateAsc(a: ClubEvent, b: ClubEvent) {
  return toEventDate(a).getTime() - toEventDate(b).getTime();
}

export function sortByDateDesc(a: ClubEvent, b: ClubEvent) {
  return toEventDate(b).getTime() - toEventDate(a).getTime();
}

export function getEventHref(event: ClubEvent) {
  if (event.category === "training") return `/trainings/${event.slug}`;
  if (event.category === "organized") return `/organized/${event.slug}`;
  return `/events/${event.slug}`;
}

export function getEventBySlug(slug: string): ClubEvent | undefined {
  return EVENTS.find(e => e.slug === slug);
}

export function getEventsByCategory(category: EventCategory): ClubEvent[] {
  return EVENTS.filter(e => e.category === category);
}

export function isUpcoming(event: ClubEvent, now = new Date()) {
  return toEventDate(event).getTime() >= now.getTime();
}

export function getUpcomingEvents(list: ClubEvent[] = EVENTS, now = new Date()) {
  return [...list].filter(e => isUpcoming(e, now)).sort(sortByDateAsc);
}

export function getPastEvents(list: ClubEvent[] = EVENTS, now = new Date()) {
  return [...list].filter(e => !isUpcoming(e, now)).sort(sortByDateDesc);
}

export function getNearestUpcomingEvent(now = new Date()) {
  const upcoming = getUpcomingEvents(EVENTS, now);
  return upcoming[0];
}

export function formatEventDate(event: ClubEvent, opts?: Intl.DateTimeFormatOptions) {
  const dt = toEventDate(event);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...opts,
  }).format(dt);
}

export function formatEventTime(event: ClubEvent) {
  if (!event.time) return "";
  return event.time;
}

export function dateKey(date: Date) {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
