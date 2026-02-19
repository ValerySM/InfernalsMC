import * as React from "react";
import { cn } from "@/lib/utils";

export type GalleryMedia =
  | { type: "image"; url: string; alt?: string }
  | { type: "embed"; url: string; title?: string }
  | { type: "video"; url: string; title?: string };

export function MediaGallery({
  media,
  className,
}: {
  media?: GalleryMedia[];
  className?: string;
}) {
  if (!media || media.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {media.map((m, idx) => {
        if (m.type === "image") {
          return (
            <a
              key={`${m.url}-${idx}`}
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="block border-4 border-gray-700 bg-black/30"
            >
              <img
                src={m.url}
                alt={m.alt || ""}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </a>
          );
        }

        if (m.type === "video") {
          return (
            <div
              key={`${m.url}-${idx}`}
              className="border-4 border-gray-700 bg-black/30"
            >
              <video
                controls
                className="w-full h-80 object-cover"
                src={m.url}
              />
            </div>
          );
        }

        // embed
        return (
          <div
            key={`${m.url}-${idx}`}
            className="border-4 border-gray-700 bg-black/30"
          >
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={m.url}
                title={m.title || "Embedded video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
