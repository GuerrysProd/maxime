"use client";

import { useEffect, useRef } from "react";

/**
 * Nombre rendu côté serveur avec sa valeur finale (SOURCES §4 : le site actuel affiche « 0 »
 * sans JavaScript) ; à l’apparition, il compte jusqu’à elle. Rien en mouvement réduit.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1150);
          element.textContent = String(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} aria-hidden="true">
      {value}
    </span>
  );
}
