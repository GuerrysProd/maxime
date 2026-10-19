"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectModules } from "@/lib/content";
import { fill } from "@/lib/typo";
import styles from "./Herbarium.module.css";

type Content = ProjectModules["herbarium"];

/** Herbier (brief §6, SOURCES §4) : palette réelle de 30 essences, filtrée par famille. */
export function Herbarium({ content }: { content: Content }) {
  const [category, setCategory] = useState<string | null>(null);
  const plants = category ? content.plants.filter((plant) => plant.category === category) : content.plants;
  const count = (n: number) => fill(n > 1 ? content.count.other : content.count.one, { n });
  const filters = [
    { id: null, label: content.all, total: content.plants.length },
    ...content.categories.map((c) => ({
      id: c.id,
      label: c.label,
      total: content.plants.filter((plant) => plant.category === c.id).length,
    })),
  ];
  const categoryLabel = (id: string) => content.categories.find((c) => c.id === id)?.label ?? id;

  return (
    <div className={styles.herbarium}>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label={content.group}>
          {filters.map((filter) => (
            <button
              key={filter.id ?? "toutes"}
              type="button"
              className={styles.chip}
              aria-pressed={filter.id === category}
              onClick={() => setCategory(filter.id)}
            >
              {filter.label}
              <span className={styles.chipCount}>{String(filter.total).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <p className="meta muted" aria-live="polite">
          {count(plants.length)}
        </p>
      </div>

      <ul className={styles.grid}>
        {plants.map((plant) => (
          <li key={plant.latin + plant.name} className={styles.card}>
            <div className={styles.photo}>
              <Image
                src={plant.image.src}
                alt=""
                fill
                sizes="(max-width: 600px) 50vw, (max-width: 1100px) 25vw, 18vw"
                placeholder={plant.image.blurDataURL ? "blur" : "empty"}
                blurDataURL={plant.image.blurDataURL}
                className={styles.image}
              />
            </div>
            <div className={styles.body}>
              <p className={`meta muted ${styles.category}`}>{categoryLabel(plant.category)}</p>
              <h3 className={`serif ${styles.name}`}>{plant.name}</h3>
              {plant.latin !== plant.name && (
                <p className={styles.latin} lang="la">
                  {plant.latin}
                </p>
              )}
              <p className={styles.flowering}>
                <span className={`meta muted ${styles.floweringLabel}`}>{content.flowering}</span>
                {plant.flowering}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
