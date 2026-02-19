import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  className?: string;
}>) {
  return (
    <div className={cn("py-10 md:py-14", className)}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase text-red-500 text-center animate-fire-glow">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 text-center text-gray-300 max-w-3xl mx-auto text-lg">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}
