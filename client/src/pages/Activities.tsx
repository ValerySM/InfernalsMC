import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";

const ITEMS = [
  {
    title: "Events Organization",
    description:
      "We organize club meetups and large public events: shows, exhibitions, concerts and more.",
    href: "/organized",
  },
  {
    title: "Club Events",
    description:
      "Parties, rides, brotherhood gatherings — updated with photos and videos.",
    href: "/events",
  },
  {
    title: "Trainings",
    description:
      "Guided trainings for new and experienced riders. Filterable calendar and event pages.",
    href: "/trainings",
  },
  {
    title: "Infernals Art Studio",
    description:
      "Custom paint, fabrication, and creative projects. Click projects to see details and media.",
    href: "/art-studio",
  },
  {
    title: "Everything Else",
    description:
      "Trips, community, collaborations, and the club life — we keep building and sharing.",
    href: "/#gallery",
  },
];

export default function Activities() {
  return (
    <div>
      <PageHeader
        title="Club Activities"
        subtitle="Everything we do — organized in one place."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITEMS.map(item => (
            <Link
              key={item.title}
              href={item.href}
              className="block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors p-6"
            >
              <h3 className="font-heading uppercase text-2xl text-red-500">
                {item.title}
              </h3>
              <p className="mt-3 text-gray-300 leading-relaxed">
                {item.description}
              </p>
              <p className="mt-6 font-heading uppercase text-gray-200">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
