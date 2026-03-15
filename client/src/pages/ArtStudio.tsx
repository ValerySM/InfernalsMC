import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/site/PageHeader";
import { useArtProjects, useSiteContent } from "@/hooks/usePublicContent";

export default function ArtStudio() {
  const { projects, loading } = useArtProjects();
  const { get } = useSiteContent();

  const instagramUrl = get("social_instagram_art_studio", "");

  return (
    <div>
      <PageHeader
        title={get("art_studio_page_title", "Infernals Art Studio")}
        subtitle={get("art_studio_page_subtitle", "Clickable projects with photos/videos and a direct link to the studio Instagram.")}
      >
        {instagramUrl && (
          <div className="flex justify-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
            >
              Studio Instagram <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </PageHeader>

      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            Loading…
          </div>
        ) : projects.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <Link
                key={p.id}
                href={`/art-studio/${p.slug}`}
                className="block border-2 border-gray-700 bg-black/30 hover:bg-black/50 transition-colors"
              >
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt={p.title}
                    className="w-full h-56 object-cover border-b-2 border-gray-700"
                    loading="lazy"
                  />
                ) : null}
                <div className="p-4">
                  <h3 className="font-heading uppercase text-xl text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-gray-300 leading-relaxed">
                    {p.shortDescription}
                  </p>
                  {p.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.slice(0, 6).map(t => (
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300 max-w-3xl mx-auto">
            No art projects yet.
          </div>
        )}
      </div>
    </div>
  );
}
