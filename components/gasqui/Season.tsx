"use client";

import { useState } from "react";
import { Picture } from "@/components/media/Picture";
import type { ProjectModules } from "@/lib/content";
import { Toggle } from "./Toggle";
import styles from "./Season.module.css";

type SeasonId = "summer" | "winter";

/* Coupe de l’ombrière (unités du viewBox 800 × 400). */
const GROUND = 340;
const TARGET = { x: 400, y: GROUND };
const POSTS = [300, 500];
const BEAM = { y: 190, from: 290, to: 510 };
const CLOTH_Y = 185;
const SUN_DISTANCE = 290;

/** Soleil, rayons et ombre pour une hauteur de soleil donnée (en degrés). */
function geometry(angle: number, cloth: boolean) {
  const rad = (angle * Math.PI) / 180;
  const d = { x: Math.cos(rad), y: Math.sin(rad) };
  const sun = { x: TARGET.x - SUN_DISTANCE * d.x, y: TARGET.y - SUN_DISTANCE * d.y };
  // Avec la toile, le rayon est filtré (et non arrêté) : sa partie sous la toile est atténuée.
  const rays = [-24, 0, 24].map((offset) => {
    const start = { x: sun.x + 26 * d.x - offset * d.y, y: sun.y + 26 * d.y + offset * d.x };
    const t = (GROUND - start.y) / d.y;
    const end = { x: start.x + t * d.x, y: GROUND };
    const tCloth = (CLOTH_Y - start.y) / d.y;
    const hit = { x: start.x + tCloth * d.x, y: CLOTH_Y };
    const filtered = cloth && tCloth > 0 && hit.x >= BEAM.from && hit.x <= BEAM.to;
    return filtered
      ? { lit: { x1: start.x, y1: start.y, x2: hit.x, y2: hit.y }, soft: { x1: hit.x, y1: hit.y, x2: end.x, y2: end.y } }
      : { lit: { x1: start.x, y1: start.y, x2: end.x, y2: end.y } };
  });
  const shift = (GROUND - CLOTH_Y) / Math.tan(rad);
  const shade = `${BEAM.from},${CLOTH_Y} ${BEAM.to},${CLOTH_Y} ${BEAM.to + shift},${GROUND} ${BEAM.from + shift},${GROUND}`;
  const arc = 52;
  const arcPath = `M ${TARGET.x - arc} ${GROUND} A ${arc} ${arc} 0 0 1 ${TARGET.x - arc * d.x} ${GROUND - arc * d.y}`;
  return { sun, rays, shade, arcPath };
}

function Scene({ angle, cloth, visible }: { angle: number; cloth: boolean; visible: boolean }) {
  const { sun, rays, shade, arcPath } = geometry(angle, cloth);
  return (
    <g className={styles.scene} data-visible={visible || undefined}>
      {cloth && <polygon points={shade} className={styles.shade} />}
      <line x1={TARGET.x} y1={TARGET.y} x2={sun.x} y2={sun.y} className={styles.guide} />
      <path d={arcPath} className={styles.guide} />
      {rays.map((ray, i) => (
        <g key={i}>
          <line {...ray.lit} className={styles.ray} />
          {ray.soft && <line {...ray.soft} className={styles.rayFiltered} />}
        </g>
      ))}
      <circle cx={sun.x} cy={sun.y} r={18} className={styles.sun} />
      {cloth && <line x1={BEAM.from} y1={CLOTH_Y} x2={BEAM.to} y2={CLOTH_Y} className={styles.cloth} />}
    </g>
  );
}

/** Été / hiver (brief §6, SOURCES §4) : coupe et hauteur du soleil, rendus réels de l’ombrière. */
export function Season({ content }: { content: ProjectModules["season"] }) {
  const [season, setSeason] = useState<SeasonId>("summer");
  const state = content[season];

  return (
    <div className={styles.grid}>
      <figure className={styles.diagram}>
        <div className={styles.svgFrame}>
          <svg viewBox="0 0 800 400" role="img" aria-label={`${content.diagram}. ${state.sunLabel}`}>
            <line x1="40" y1={GROUND} x2="760" y2={GROUND} className={styles.ground} />
            {POSTS.map((x) => (
              <line key={x} x1={x} y1={GROUND} x2={x} y2={BEAM.y} className={styles.post} />
            ))}
            <line x1={BEAM.from} y1={BEAM.y} x2={BEAM.to} y2={BEAM.y} className={styles.post} />
            <Scene angle={content.summer.sun} cloth visible={season === "summer"} />
            <Scene angle={content.winter.sun} cloth={false} visible={season === "winter"} />
          </svg>
        </div>
        <figcaption className={styles.caption}>
          <span className="meta">{state.sunLabel}</span>
          <span className="meta muted">{content.diagram}</span>
        </figcaption>
      </figure>

      <div className={styles.side}>
        <Toggle
          label={content.group}
          value={season}
          onChange={setSeason}
          options={[
            { id: "summer", label: content.summer.button },
            { id: "winter", label: content.winter.button },
          ]}
        />
        <div className={styles.frame} data-season={season}>
          <div className={styles.photo} aria-hidden={season !== "summer"}>
            <Picture image={content.summer.image} sizes="(max-width: 900px) 100vw, 33vw" />
          </div>
          <div className={`${styles.photo} ${styles.winter}`} aria-hidden={season !== "winter"}>
            <Picture image={content.winter.image} sizes="(max-width: 900px) 100vw, 33vw" />
          </div>
          <span className={`meta ${styles.badge}`} aria-hidden="true">
            {state.label}
          </span>
        </div>
        <p className={styles.text} aria-live="polite">
          {state.text}
        </p>
      </div>
    </div>
  );
}
