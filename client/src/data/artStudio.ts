import { cdnUrls, social } from "@/site/content";

export interface ArtProject {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  cover?: string;
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "embed"; url: string; title?: string }
    | { type: "video"; url: string; title?: string }
  >;
}

export const ART_STUDIO_INSTAGRAM = social.instagramArtStudio;

/**
 * Art Studio projects.
 * Add new projects here with photos/videos + description.
 */
export const ART_PROJECTS: ArtProject[] = [
  {
    id: "art-helmet-fire",
    slug: "helmet-fire-theme",
    title: "Helmet — Fire Theme",
    shortDescription: "Custom paint with infernal flames and matte finish.",
    description:
      "A custom helmet paint job with layered flames, matte clear coat, and subtle metallic highlights. Built to look aggressive in daylight and glow under street lights.",
    tags: ["paint", "helmet", "custom"],
    cover: cdnUrls.artStudioHero,
    media: [
      { type: "image", url: cdnUrls.artStudioHero, alt: "Helmet cover" },
      { type: "image", url: cdnUrls.gallery1, alt: "Detail shot" },
    ],
  },
  {
    id: "art-tank-lettering",
    slug: "tank-hand-lettering",
    title: "Tank Hand Lettering",
    shortDescription: "Old-school lettering and pinstriping.",
    description:
      "Hand lettering with classic pinstriping. Clean lines, bold contrast, and a finish that matches the club's grunge aesthetic.",
    tags: ["paint", "bike", "pinstripe"],
    cover: cdnUrls.gallery2,
    media: [
      { type: "image", url: cdnUrls.gallery2, alt: "Tank lettering" },
      { type: "image", url: cdnUrls.gallery3, alt: "Pinstripe close-up" },
    ],
  },
  {
    id: "art-metal-fabrication",
    slug: "metal-fabrication-brackets",
    title: "Metal Fabrication",
    shortDescription: "Custom brackets and small parts — built for the road.",
    description:
      "Fabrication work for riders who want something that fits perfectly. Measurements, test fit, weld, finish — done like it should be.",
    tags: ["fabrication", "metal", "custom"],
    cover: cdnUrls.gallery1,
    media: [
      { type: "image", url: cdnUrls.gallery1, alt: "Workshop" },
    ],
  },
];

export function getArtProjectBySlug(slug: string): ArtProject | undefined {
  return ART_PROJECTS.find(p => p.slug === slug);
}

export function getArtProjectHref(project: ArtProject) {
  return `/art-studio/${project.slug}`;
}
