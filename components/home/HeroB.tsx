"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ImageAsset } from "@/lib/content";
import { Picture } from "@/components/media/Picture";
import { Icon } from "@/components/ui/Icon";
import styles from "./HeroB.module.css";

export interface HeroBItem {
  slug: string;
  number: string;
  name: string;
  place: string;
  placeShort: string;
  href: string;
  image: ImageAsset;
}

/**
 * Hero B (écran 04B, route /2) : fond Lin, titre à gauche, image à droite bord à bord.
 * Survol ou focus d’une ligne de l’index : l’image change en fondu 0,8 s et la légende
 * « À l’image — 0X / 07 » se met à jour. Les images sont décoratives (la légende nomme le projet).
 */
export function HeroB({
  items,
  intro,
  indexTitle,
  countLabel,
  captionPrefix,
  titleId,
}: {
  items: HeroBItem[];
  intro: ReactNode;
  indexTitle: string;
  countLabel: string;
  captionPrefix: string;
  titleId: string;
}) {
  const [current, setCurrent] = useState(0);
  const item = items[current];
  const total = String(items.length).padStart(2, "0");

  return (
    <section className={styles.hero} data-hero aria-labelledby={titleId}>
      <div className={styles.left}>
        <div className={styles.intro}>{intro}</div>
        <div className={styles.index}>
          <div className={styles.indexHead}>
            <h2 className="meta">{indexTitle}</h2>
            <p className="meta muted">{countLabel}</p>
          </div>
          <ul>
            {items.map((entry, index) => (
              <li key={entry.slug}>
                <Link
                  href={entry.href}
                  className={styles.row}
                  data-on={index === current || undefined}
                  onPointerEnter={(event) => event.pointerType === "mouse" && setCurrent(index)}
                  onFocus={() => setCurrent(index)}
                >
                  <span className={styles.number}>{entry.number}</span>
                  <span className={styles.name}>{entry.name}</span>
                  <span className={styles.place}>{entry.placeShort}</span>
                  <Icon name="arrow-up-right" size={16} className={styles.arrow} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figure className={styles.figure}>
        {items.map((entry, index) => (
          <div key={entry.slug} className={styles.slide} data-on={index === current || undefined}>
            <Picture image={entry.image} alt="" sizes="(max-width: 900px) 100vw, 50vw" preload={index === 0} />
          </div>
        ))}
        <div className={styles.shade} aria-hidden="true" />
        <figcaption className={styles.caption}>
          <p className="meta muted">
            {captionPrefix} — {item.number} / {total}
          </p>
          <p className={`serif ${styles.captionTitle}`}>
            {item.name}, {item.place}
          </p>
        </figcaption>
      </figure>
    </section>
  );
}
