"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import type { Figure } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import styles from "./BeforeAfter.module.css";

const KEY_STEP = 5;

export interface BeforeAfterLabels {
  label: string;
  valueText: string;
  hint: string;
  before: string;
  after: string;
}

/**
 * Curseur avant / après (brief §6) : l’image « avant » est découpée par clip-path ; un
 * <input type="range"> transparent couvre l’image (souris, toucher, clavier par pas de 5).
 */
export function BeforeAfter({
  before,
  after,
  initial = 50,
  labels,
  sizes = "(max-width: 900px) 100vw, 66vw",
}: {
  before: Figure;
  after: Figure;
  initial?: number;
  labels: BeforeAfterLabels;
  sizes?: string;
}) {
  const [value, setValue] = useState(initial);
  const valueText = labels.valueText.replace("{before}", String(value)).replace("{after}", String(100 - value));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const delta = { ArrowLeft: -KEY_STEP, ArrowDown: -KEY_STEP, ArrowRight: KEY_STEP, ArrowUp: KEY_STEP }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    setValue((current) => Math.min(100, Math.max(0, current + delta)));
  };

  const captions = [before.caption, after.caption].filter(Boolean).join(" · ");

  return (
    <figure className={styles.figure}>
      <div className={styles.stage} style={{ aspectRatio: `${after.image.width} / ${after.image.height}` }}>
        <Image
          src={after.image.src}
          alt={after.image.alt}
          fill
          sizes={sizes}
          placeholder={after.image.blurDataURL ? "blur" : "empty"}
          blurDataURL={after.image.blurDataURL}
          style={{ objectFit: "cover", objectPosition: after.image.position }}
        />
        <div className={styles.before} style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <Image
            src={before.image.src}
            alt={before.image.alt}
            fill
            sizes={sizes}
            style={{ objectFit: "cover", objectPosition: before.image.position }}
          />
        </div>
        <span className={`meta ${styles.tag} ${styles.tagBefore}`} aria-hidden="true">
          {labels.before}
        </span>
        <span className={`meta ${styles.tag} ${styles.tagAfter}`} aria-hidden="true">
          {labels.after}
        </span>
        <div className={styles.line} style={{ left: `${value}%` }} aria-hidden="true">
          <span className={styles.knob}>
            <Icon name="arrows-h" size={20} />
          </span>
        </div>
        <input
          className={styles.range}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          onKeyDown={onKeyDown}
          aria-label={labels.label}
          aria-valuetext={valueText}
        />
      </div>
      <figcaption className={`meta muted ${styles.caption}`}>
        <span>{labels.hint}</span>
        {captions && <span>{captions}</span>}
      </figcaption>
    </figure>
  );
}
