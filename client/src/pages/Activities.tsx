import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";
import { useSiteContent } from "@/hooks/usePublicContent";

export default function Activities() {
  const { get } = useSiteContent();

  const cards = [
    {
      title: get("activities_card_1_title", "Events Organization"),
      description: get("activities_card_1_desc", "We organize club meetups and large public events: shows, exhibitions, concerts and more."),
      href: get("activities_card_1_href", "/organized"),
    },
    {
      title: get("activities_card_2_title", "Club Events"),
      description: get("activities_card_2_desc", "Parties, rides, brotherhood gatherings — updated with photos and videos."),
      href: get("activities_card_2_href", "/events"),
    },
    {
      title: get("activities_card_3_title", "Trainings"),
      description: get("activities_card_3_desc", "Guided trainings for new and experienced riders. Filterable calendar and event pages."),
      href: get("activities_card_3_href", "/trainings"),
    },
    {
      title: get("activities_card_4_title", "Infernals Art Studio"),
      description: get("activities_card_4_desc", "Custom paint, fabrication, and creative projects. Click projects to see details and media."),
      href: get("activities_card_4_href", "/art-studio"),
    },
    {
      title: get("activities_card_5_title", "Everything Else"),
      description: get("activities_card_5_desc", "Trips, community, collaborations, and the club life — we keep building and sharing."),
      href: get("activities_card_5_href", "/#gallery"),
    },
  ].filter(c => c.title);

  return (
    <div>
      <PageHeader
        title={get("activities_title", "Club Activities")}
        subtitle={get("activities_subtitle", "Everything we do — organized in one place.")}
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(item => (
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
