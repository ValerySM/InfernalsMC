import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { MediaGallery } from "@/components/site/MediaGallery";
import { PageHeader } from "@/components/site/PageHeader";
import {
  ART_STUDIO_INSTAGRAM,
  getArtProjectBySlug,
} from "@/data/artStudio";

export default function ArtProject({ slug }: { slug: string }) {
  const project = getArtProjectBySlug(slug);

  if (!project) {
    return (
      <div>
        <PageHeader title="Project Not Found" subtitle="This art project does not exist." />
        <div className="container mx-auto px-4 pb-16">
          <Link
            href="/art-studio"
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            <ArrowLeft className="size-4" /> Back to Art Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={project.title} subtitle={project.shortDescription}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/art-studio"
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            <ArrowLeft className="size-4" /> Back to Art Studio
          </Link>
          <a
            href={ART_STUDIO_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            Studio Instagram <ExternalLink className="size-4" />
          </a>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-16">
        {project.tags?.length ? (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            {project.tags.map(t => (
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

        <div className="border-2 border-gray-700 bg-black/30 p-6">
          <p className="text-gray-300 leading-relaxed max-w-4xl mx-auto">
            {project.description}
          </p>
        </div>

        <div className="mt-10">
          <MediaGallery media={project.media} />
        </div>
      </div>
    </div>
  );
}


