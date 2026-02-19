import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TagCloud({
  tags,
  selected,
  onToggle,
  className,
}: {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  className?: string;
}) {
  if (!tags.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 justify-center", className)}>
      {tags.map(tag => {
        const isOn = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className="focus:outline-none"
          >
            <Badge
              variant={isOn ? "default" : "outline"}
              className={cn(
                "uppercase tracking-wide",
                !isOn && "border-gray-700 text-gray-200 hover:bg-black/40"
              )}
            >
              {tag}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
