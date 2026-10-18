"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Mouvement au défilement (brief §7), pour toute la page, sans bibliothèque :
 * - [data-reveal] : apparition unique (fondu + translation) quand l’élément entre à l’écran ;
 * - [data-parallax="0.08"] : l’élément glisse d’une fraction de sa hauteur pendant le défilement
 *   (desktop uniquement, jamais en mouvement réduit).
 * Sans JavaScript, ou en mouvement réduit, tout est affiché d’emblée (voir globals.css).
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach((el) => observer.observe(el));

    const motionOk = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    const layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const layer of layers) {
        if (!motionOk.matches) {
          layer.style.removeProperty("--parallax");
          continue;
        }
        const box = (layer.parentElement ?? layer).getBoundingClientRect();
        if (box.bottom < 0 || box.top > viewport) continue;
        const amount = Number(layer.dataset.parallax) || 0.04;
        // L’image défile moins vite que la page. Hero (« top ») : elle descend quand on quitte
        // le haut de page ; ailleurs, elle se décale de ±amount autour du centre de l’écran.
        const progress =
          layer.dataset.parallaxMode === "top"
            ? Math.min(1, Math.max(0, -box.top / box.height))
            : -Math.min(1, Math.max(-1, (box.top + box.height / 2 - viewport / 2) / ((viewport + box.height) / 2)));
        layer.style.setProperty("--parallax", `${(progress * amount * box.height).toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    if (layers.length) {
      frame = requestAnimationFrame(update);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      motionOk.addEventListener("change", onScroll);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motionOk.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
