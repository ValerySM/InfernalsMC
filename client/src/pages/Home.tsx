import type { ComponentType } from "react";
import { Link } from "wouter";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Section, SectionSubtitle, SectionTitle } from "@/components/site/Section";
import { cdnUrls, contacts } from "@/site/content";
import {
  getNearestUpcomingEvent,
  getUpcomingEvents,
  getEventHref,
  formatEventDate,
  formatEventTime,
  getEventsByCategory,
} from "@/data/events";

const members = [
  { role: "PRESIDENT", name: "STAS" },
  { role: "V.PRESIDENT", name: "PASHA" },
  { role: "SECRETARY", name: "SAGIF" },
  { role: "TREASURE", name: "YURI" },
  { role: "SGT AT ARMS", name: "VALERY" },
  { role: "ROAD CAPTAIN", name: "GIL" },
] as const;

function PlaceholderImage({
  text,
  Icon,
}: {
  text: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-gray-800/50 border-2 border-gray-600 flex flex-col items-center justify-center aspect-square w-full h-full text-gray-400">
      <Icon className="text-5xl mb-2" />
      <span className="font-heading text-center p-2 uppercase">{text}</span>
    </div>
  );
}

function NextEventBanner() {
  const next = getNearestUpcomingEvent(new Date());

  if (!next) {
    return (
      <div className="mt-10 border-2 border-gray-700 bg-black/30 p-6 text-center max-w-4xl mx-auto">
        <p className="font-heading uppercase text-gray-200">
          No upcoming events scheduled yet
        </p>
        <p className="mt-2 text-gray-400">
          Check the calendar — we update it continuously.
        </p>
        <div className="mt-6">
          <Link
            href="/events"
            className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-5 py-3 font-heading uppercase text-gray-200"
          >
            Open Events Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 border-2 border-red-500/30 bg-black/40 p-6 max-w-4xl mx-auto">
      <p className="font-heading uppercase text-red-500 text-center">
        Next Event
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
  const upcomingClubEvents = getUpcomingEvents(getEventsByCategory("event")).slice(
    0,
    3
  );
  const upcomingTrainings = getUpcomingEvents(
    getEventsByCategory("training")
  ).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-black">
        <img
          src={cdnUrls.heroMain}
          alt="Infernals MC Israel Logo"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </section>

      {/* About */}
      <Section id="about">
        <SectionTitle>About Us</SectionTitle>
        <p
          className="text-center text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          dir="rtl"
        >
          מועדון אופנוענים INFERNALS MC ISRAEL. מועדון חברים שאוהבים אופנועים,
          חופש וחיים שמחים! אנחנו אוהבים לרכב על אופנועים, לתקן ולשפר אותם,
          ללמד רוכבים חדשים על איך לטפל נכון באופנוע, איך לרכב בצורה בטיחותית
          ולגלות מקומות מטריפים בארץ ובחו"ל! וכמובן אוהבים לעשות מסיבות
          ולהזמין המון חברים!
        </p>

        {/* Requirement: nearest event directly after the club description */}
        <NextEventBanner />
      </Section>

      {/* Quick Links */}
      <Section>
        <SectionTitle>Explore</SectionTitle>
        <SectionSubtitle>
          Everything is structured into pages — events, trainings, art projects,
          and support.
        </SectionSubtitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Events", desc: "Calendar + media pages", href: "/events" },
            { title: "Trainings", desc: "Only training events", href: "/trainings" },
            { title: "Art Studio", desc: "Clickable projects", href: "/art-studio" },
            { title: "Support", desc: "Donate & help the club", href: "/support" },
          ].map(x => (
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
        <SectionTitle>Club Officers</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {members.map(m => (
            <div key={m.name} className="text-center">
              <PlaceholderImage text={m.name} Icon={User} />
              <h3 className="mt-4 font-heading text-xl font-bold text-red-500 uppercase">
                {m.role}
              </h3>
              <p className="text-gray-300 text-lg">{m.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Upcoming previews */}
      <Section>
        <SectionTitle>Upcoming</SectionTitle>
        <SectionSubtitle>Next club events and trainings.</SectionSubtitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="font-heading uppercase text-2xl text-red-500 text-center">
              Events
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
                  No upcoming club events.
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
              >
                Open Events Calendar
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading uppercase text-2xl text-red-500 text-center">
              Trainings
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
                  No upcoming trainings.
                </div>
              )}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/trainings"
                className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
              >
                Open Trainings Calendar
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Gallery */}
      <Section id="gallery">
        <SectionTitle>Gallery</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <img
            src={cdnUrls.gallery1}
            alt="Gallery 1"
            className="w-full h-80 object-cover border-4 border-gray-700"
          />
          <img
            src={cdnUrls.gallery2}
            alt="Gallery 2"
            className="w-full h-80 object-cover border-4 border-gray-700"
          />
          <img
            src={cdnUrls.gallery3}
            alt="Gallery 3"
            className="w-full h-80 object-cover border-4 border-gray-700"
          />
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact">
        <SectionTitle>Contact Us</SectionTitle>
        <div className="max-w-2xl mx-auto text-center text-lg">
          <p className="text-gray-300">
            Phone: <a className="hover:text-white" href={`tel:${contacts.phone}`}>{contacts.phone}</a>
          </p>
          <p className="mt-2 text-gray-300">
            Email: <a className="hover:text-white" href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </p>
          <p className="mt-4 text-gray-300" dir="rtl">
            {contacts.addressHe}
          </p>
        </div>
      </Section>
    </div>
  );
}
