import * as React from "react";
import { useLocation } from "wouter";

/**
 * Smoothly scrolls to the top on route changes.
 * Keeps hash navigation working (/#section).
 */
export function ScrollRestoration() {
  const [location] = useLocation();

  React.useEffect(() => {
    const { hash } = window.location;

    if (hash) {
      const id = hash.replace(/^#/, "");
      // Wait one paint for the new route to render.
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return null;
}
