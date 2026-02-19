import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
}: React.PropsWithChildren<{ id?: string; className?: string }>) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-16 md:py-24 text-white overflow-hidden bg-black/70",
        className
      )}
    >
      <div
        className="absolute top-0 left-0 w-full h-16 bg-black -mt-16"
        style={{ clipPath: "polygon(0 0, 100% 100%, 100% 0)" }}
      />
      <div className="container mx-auto px-4 z-10 relative">{children}</div>
      <div
        className="absolute -bottom-1 left-0 w-full h-16 bg-black"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      />
    </section>
  );
}

export function SectionTitle({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <h2
      className={cn(
        "text-4xl md:text-5xl font-heading font-bold uppercase text-center mb-2 text-red-500",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function SectionSubtitle({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <p
      className={cn(
        "text-center text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto",
        className
      )}
    >
      {children}
    </p>
  );
}
