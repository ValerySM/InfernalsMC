import * as React from "react";
import type { ComponentType } from "react";
import { Link } from "wouter";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Section, SectionSubtitle, SectionTitle } from "@/components/site/Section";
import {
  getUpcomingEvents,
  getEventHref,
  formatEventDate,
  formatEventTime,
  getNearestUpcomingEvent,
  getEventsByCategory,
} from "@/data/events";
import { usePublicEvents, usePublicGallery, useSiteContent, useMembers } from "@/hooks/usePublicContent";
import type { ClubEvent } from "@/data/events";

function PlaceholderImage({
  text,
  Icon,
  photoUrl,
}: {
  text: string;
  Icon: ComponentType<{ className?: string }>;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <div className="aspect-square w-full h-full overflow-hidden border-2 border-gray-600">
        <img src={photoUrl} alt={text} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 flex flex-col items-center justify-center aspect-square w-full h-full text-gray-400">
      <Icon className="text-5xl mb-2" />
      <span className="font-heading text-center p-2 uppercase">{text}</span>
    </div>
  );
}

function NextEventBanner({
  events,
  get,
}: {
  events: ClubEvent[];
  get: (key: string, fallback: string) => string;
}) {
  const next = getNearestUpcomingEvent(new Date(), events);

  if (!next) {
    return (
      <div className="mt-10 border-2 border-gray-700 bg-black/30 p-6 text-center max-w-4xl mx-auto">
        <p className="font-heading uppercase text-gray-200">
          {get("home_no_upcoming_title", "No upcoming events scheduled yet")}
        </p>
        <p className="mt-2 text-gray-400">
          {get("home_no_upcoming_text", "Check the calendar — we update it continuously.")}
        </p>
        <div className="mt-6">
          <Link
            href="/events"
            className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-5 py-3 font-heading uppercase text-gray-200"
          >
            {get("home_open_events_btn", "Open Events Calendar")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 border-2 border-red-500/30 bg-black/40 p-6 max-w-4xl mx-auto">
      <p className="font-heading uppercase text-red-500 text-center">
        {get("home_next_event_label", "Next Event")}
      </p>
      <h3 className="mt-3 font-heading uppercase text-2xl text-white text-center">
        {next.title}
      </h3>
      <p className="mt-2 text-center text-gray-300">
        {formatEventDate(next)}{next.time ? ` • ${formatEventTime(next)}` : ""}
        {next.location ? ` • ${next.location}` : ""}
      </p>

      {next.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {next.tags.slice(0, 8).map(t => (
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

      <p className="mt-4 text-gray-300 leading-relaxed text-center">
        {next.shortDescription}
      </p>

      <div className="mt-6 flex justify-center">
        <Link
          href={getEventHref(next)}
          className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 font-heading uppercase"
        >
          Open Event Page
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { events: allEvents, loading: eventsLoading, error: eventsError } = usePublicEvents();
  const { items: galleryItems, loading: galleryLoading } = usePublicGallery();
  const { get, loading: contentLoading } = useSiteContent();
  const { members, loading: membersLoading } = useMembers();

  const upcomingClubEvents = React.useMemo(() => {
    const list = getEventsByCategory("event", allEvents);
    return getUpcomingEvents(list).slice(0, 3);
  }, [allEvents]);

  const upcomingTrainings = React.useMemo(() => {
    const list = getEventsByCategory("training", allEvents);
    return getUpcomingEvents(list).slice(0, 3);
  }, [allEvents]);

  const galleryTop3 = React.useMemo(() => galleryItems.slice(0, 3), [galleryItems]);

  const exploreCards = [
    {
      title: get("home_explore_1_title", "Events"),
      desc: get("home_explore_1_desc", "Calendar + media pages"),
      href: get("home_explore_1_href", "/events"),
    },
    {
      title: get("home_explore_2_title", "Trainings"),
      desc: get("home_explore_2_desc", "Only training events"),
      href: get("home_explore_2_href", "/trainings"),
    },
    {
      title: get("home_explore_3_title", "Art Studio"),
      desc: get("home_explore_3_desc", "Clickable projects"),
      href: get("home_explore_3_href", "/art-studio"),
    },
    {
      title: get("home_explore_4_title", "Support"),
      desc: get("home_explore_4_desc", "Donate & help the club"),
      href: get("home_explore_4_href", "/support"),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-black">
        <img
          src={get("hero_image_url", "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/RVKRdjdkguMSvyhL.png")}
          alt={get("hero_image_alt", "Infernals MC Israel Logo")}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </section>

      {/* About */}
      <Section id="about">
        <SectionTitle>{get("about_title", "About Us")}</SectionTitle>
        <p
          className="text-center text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          dir={get("about_text_dir", "rtl") as "rtl" | "ltr"}
        >
          {get("about_text", "")}
        </p>

        {/* Requirement: nearest event directly after the club description */}
        {eventsLoading ? (
          <div className="mt-10 border-2 border-gray-700 bg-black/30 p-6 text-center max-w-4xl mx-auto">
            <p className="font-heading uppercase text-gray-200">Loading events…</p>
          </div>
        ) : eventsError ? (
          <div className="mt-10 border border-red-500/40 bg-red-500/10 text-red-200 p-6 text-center max-w-4xl mx-auto">
            {String(eventsError)}
          </div>
        ) : (
          <NextEventBanner events={allEvents} get={get} />
        )}
      </Section>

      {/* Quick Links */}
      <Section>
        <SectionTitle>{get("explore_title", "Explore")}</SectionTitle>
        <SectionSubtitle>
          {get("explore_subtitle", "Everything is structured into pages — events, trainings, art projects, and support.")}
        </SectionSubtitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exploreCards.map(x => (
            <Link
              key={x.title}
              href={x.href}
              className="block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors p-6"
            >
              <h3 className="font-heading uppercase text-2xl text-red-500">
                {x.title}
              </h3>
              <p className="mt-3 text-gray-300 leading-relaxed">{x.desc}</p>
              <p className="mt-6 font-heading uppercase text-gray-200">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* Officers */}
      <Section id="members">
        <SectionTitle>{get("officers_title", "Club Officers")}</SectionTitle>
        {membersLoading ? (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            Loading…
          </div>
        ) : members.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {members.map(m => (
              <div key={m.id} className="text-center">
                <PlaceholderImage text={m.name} Icon={User} photoUrl={m.photoUrl} />
                <h3 className="mt-4 font-heading text-xl font-bold text-red-500 uppercase">
                  {m.role}
                </h3>
                <p className="text-gray-300 text-lg">{m.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            No club officers listed yet.
          </div>
        )}
      </Section>

      {/* Upcoming previews */}
      <Section>
        <SectionTitle>{get("upcoming_title", "Upcoming")}</SectionTitle>
        <SectionSubtitle>{get("upcoming_subtitle", "Next club events and trainings.")}</SectionSubtitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="font-heading uppercase text-2xl text-red-500 text-center">
              {get("home_upcoming_events_label", "Events")}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {upcomingClubEvents.length ? (
                upcomingClubEvents.map(e => (
                  <Link
                    key={e.id}
                    href={getEventHref(e)}
                    className="block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    {e.cover ? (
                      <img
                        src={e.cover}
                        alt={e.title}
                        className="w-full h-48 object-cover border-b-2 border-gray-700"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="p-4">
                      <p className="font-heading uppercase text-red-500">
                        {formatEventDate(e)}
                      </p>
                      <h4 className="mt-2 font-heading uppercase text-xl text-white">
                        {e.title}
                      </h4>
                      <p className="mt-2 text-gray-300">{e.shortDescription}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300">
                  {get("home_no_upcoming_events", "No upcoming club events.")}
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
              >
                {get("home_open_events_btn", "Open Events Calendar")}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading uppercase text-2xl text-red-500 text-center">
              {get("home_upcoming_trainings_label", "Trainings")}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {upcomingTrainings.length ? (
                upcomingTrainings.map(e => (
                  <Link
                    key={e.id}
                    href={getEventHref(e)}
                    className="block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    {e.cover ? (
                      <img
                        src={e.cover}
                        alt={e.title}
                        className="w-full h-48 object-cover border-b-2 border-gray-700"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="p-4">
                      <p className="font-heading uppercase text-red-500">
                        {formatEventDate(e)}
                      </p>
                      <h4 className="mt-2 font-heading uppercase text-xl text-white">
                        {e.title}
                      </h4>
                      <p className="mt-2 text-gray-300">{e.shortDescription}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300">
                  {get("home_no_upcoming_trainings", "No upcoming trainings.")}
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/trainings"
                className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
              >
                {get("home_open_trainings_btn", "Open Trainings Calendar")}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Gallery */}
      <Section id="gallery">
        <SectionTitle>{get("gallery_title", "Gallery")}</SectionTitle>
        {galleryLoading ? (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            Loading…
          </div>
        ) : galleryTop3.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {galleryTop3.map((it, idx) => (
              <a
                key={it.id || idx}
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="block border-4 border-gray-700 bg-black/30"
              >
                {it.type === "image" ? (
                  <img
                    src={it.url}
                    alt={(it as any).alt || `Gallery ${idx + 1}`}
                    className="w-full h-80 object-cover"
                    loading="lazy"
                  />
                ) : it.type === "video" ? (
                  <video controls className="w-full h-80 object-cover" src={it.url} />
                ) : (
                  <div className="aspect-video w-full h-80">
                    <iframe
                      className="w-full h-full"
                      src={it.url}
                      title={(it as any).title || "Embedded"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            No gallery items yet.
          </div>
        )}
      </Section>

      {/* Contact */}
      <Section id="contact">
        <SectionTitle>{get("contact_title", "Contact Us")}</SectionTitle>
        <div className="max-w-2xl mx-auto text-center text-lg">
          <p className="text-gray-300">
            Phone: <a className="hover:text-white" href={`tel:${get("contact_phone", "")}`}>{get("contact_phone", "")}</a>
          </p>
          <p className="mt-2 text-gray-300">
            Email: <a className="hover:text-white" href={`mailto:${get("contact_email", "")}`}>{get("contact_email", "")}</a>
          </p>
          <p className="mt-4 text-gray-300" dir="rtl">
            {get("contact_address_he", "")}
          </p>
        </div>
      </Section>
    </div>
  );
}
