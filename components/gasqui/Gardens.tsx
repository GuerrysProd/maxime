"use client";

import { useState } from "react";
import { Picture } from "@/components/media/Picture";
import { Icon } from "@/components/ui/Icon";
import type { ProjectModules } from "@/lib/content";
import styles from "./Gardens.module.css";

/** Les quatre jardins (site actuel : sélecteur de zones de gasqui.js), un à la fois. */
export function Gardens({ gardens, paletteHref }: { gardens: ProjectModules["gardens"]; paletteHref: string }) {
  const [current, setCurrent] = useState(0);
  const garden = gardens.items[current];

  return (
    <div className={styles.gardens}>
      <div className={styles.selector} role="group" aria-label={gardens.group}>
        {gardens.items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={styles.tab}
            aria-pressed={index === current}
            aria-controls="jardin-courant"
            onClick={() => setCurrent(index)}
          >
            <span className={styles.tabNumber}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.tabTitle}>{item.title}</span>
          </button>
        ))}
      </div>

      <div id="jardin-courant" className={styles.feature}>
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Picture key={garden.id} image={garden.image} sizes="(max-width: 900px) 100vw, 58vw" />
          </div>
          <figcaption className="meta muted">{garden.caption}</figcaption>
        </figure>
        <div className={styles.content}>
          <p className="meta muted">{garden.kicker}</p>
          <h3 className={`serif ${styles.title}`}>{garden.title}</h3>
          <p className={styles.description}>{garden.description}</p>
          <ul className={styles.facts}>
            {garden.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <a className={styles.link} href={paletteHref}>
            {gardens.paletteLink}
            <Icon name="arrow-down" size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
