"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { ProjectModules } from "@/lib/content";
import { fill } from "@/lib/typo";
import styles from "./LayerPlan.module.css";

type Plan = ProjectModules["plan"];

/**
 * Plan en calques (brief §6, SOURCES §4) : le plan reste collant, chaque étape du récit
 * atteinte au défilement ajoute ses calques (fondu 0,7 s). Les étapes sont aussi des boutons.
 * Regroupements et ordre d’empilement repris de initPlan() / gasqui.css du site actuel.
 */
export function LayerPlan({ plan, steps }: { plan: Plan; steps: { title: ReactNode; text: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // Étape courante : la dernière dont le haut a franchi le milieu de l’écran.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = Array.from(list.children) as HTMLElement[];
      const line = window.innerHeight * 0.55;
      let current = 0;
      items.forEach((item, index) => {
        if (item.getBoundingClientRect().top <= line) current = index;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const isVisible = (layer: Plan["layers"][number]) =>
    layer.step <= active && (layer.until === undefined || active <= layer.until);
  const visibleCount = plan.layers.filter(isVisible).length;
  const showSpaces = plan.layers.some((layer) => layer.until !== undefined && isVisible(layer));

  return (
    <div className={styles.plan}>
      <figure className={styles.figure}>
        <div className={styles.canvas}>
          {plan.layers.map((layer) => (
            <Image
              key={layer.id}
              src={layer.src.src}
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              className={styles.layer}
              data-visible={isVisible(layer) || undefined}
              data-focus={layer.focus === active || undefined}
              style={{ "--layer-opacity": layer.opacity ?? 1 } as CSSProperties}
            />
          ))}
          {plan.spaces.map((space) => (
            <span
              key={space.name}
              className={styles.space}
              data-visible={showSpaces || undefined}
              style={{ left: `${space.x}%`, top: `${space.y}%` }}
              aria-hidden="true"
            >
              {space.name}
            </span>
          ))}
        </div>
        <figcaption className={styles.caption}>
          <span className="meta muted">{plan.caption}</span>
          <span className="meta muted" aria-live="polite">
            {fill(plan.visible, { n: visibleCount, total: plan.layers.length })}
          </span>
        </figcaption>
      </figure>

      <ol ref={listRef} className={styles.steps} aria-label={plan.group}>
        {steps.map((step, index) => (
          <li key={plan.steps[index].id} className={styles.step}>
            <button type="button" className={styles.button} aria-pressed={index === active} onClick={() => setActive(index)}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={`serif ${styles.title}`}>{step.title}</span>
              <span className={styles.text}>{step.text}</span>
            </button>
            {plan.steps[index].facts && (
              <ul className={styles.facts}>
                {plan.steps[index].facts?.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
