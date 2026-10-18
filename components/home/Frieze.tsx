"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/lib/content";
import styles from "./CtaSection.module.css";

/**
 * Frise d’images en défilement très lent (≈ 80 s par cycle), en pause au survol, au focus
 * et sur demande (bouton, critère WCAG 2.2.2) ; figée si l’utilisateur réduit les animations.
 */
export function Frieze({ images, labels }: { images: ImageAsset[]; labels: { pause: string; play: string } }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={styles.frieze} data-paused={paused || undefined}>
      <div className={styles.track} aria-hidden="true">
        {[...images, ...images].map((image, index) => (
          <div key={index} className={styles.frame}>
            <Image src={image.src} alt="" fill sizes="(max-width: 900px) 200px, 300px" style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.pause}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
        <span className="sr-only">{paused ? labels.play : labels.pause}</span>
      </button>
    </div>
  );
}
