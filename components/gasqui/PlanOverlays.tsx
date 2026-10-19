"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { ImageAsset } from "@/lib/content";
import styles from "./PlanOverlays.module.css";

/*
 * Tracés repris de page.html (site actuel), dans le repère du plan plan-gasqui.png.
 * Réseau des guirlandes : plan à l’échelle 1 (2200 × 1148), vue 205 105 1435 470.
 * Tracé des miroirs : plan posé en 44 65 680 × 355, vue 350 95 105 140.
 */
const GARLAND_VIEW = { x: 205, y: 105, w: 1435, h: 470 };
const GARLAND_PLAN = { x: 0, y: 0, w: 2200, h: 1148 };
const GARLAND_ROUTES = [
  "M983.6 247.8 H1150 V398.2 H986.5 Z",
  "M1150 246.4 L1304.2 213.2 L1571.5 212.4",
  "M1150 398.2 L1304.2 440.3 L1570.9 440.3",
  "M986.5 398.2 L1059.8 516.3 L1150 398.2",
  "M983.6 247.8 L891.8 165.9 L613.4 234.1 L454.6 333.6",
  "M454.6 333.6 L265.8 281.1 L316.4 489.4",
  "M454.6 333.6 L513.2 488.2 L689.2 363.7 Z",
  "M454.6 333.6 L613.4 234.1 L689.2 363.7",
  "M891.8 165.9 L983.6 247.8",
  "M830 339 L983.6 247.8 M830 339 L986.5 398.2",
];
/** Ordre de déploiement : depuis l’espace central (délais du site actuel). */
const GARLAND_DELAYS = [0.35, 1.05, 1.05, 1.05, 1.3, 2.05, 2.05, 2.05, 1.3, 1.3];
const GARLAND_ANCHORS: [number, number][] = [
  [983.6, 247.8], [1150, 246.4], [1150, 398.2], [986.5, 398.2], [1059.8, 516.3],
  [1304.2, 213.2], [1304.2, 440.3], [891.8, 165.9], [613.4, 234.1], [454.6, 333.6],
  [265.8, 281.1], [316.4, 489.4], [513.2, 488.2], [689.2, 363.7], [830, 339],
];

const MIRROR_VIEW = { x: 350, y: 95, w: 105, h: 140 };
const MIRROR_PLAN = { x: 44, y: 65, w: 680, h: 355 };
const MIRROR_ROUTE = "M394.027 222.008 L430.910 202.191 L426.242 131.160 L374.496 110.843 L374.496 161.781";
const MIRRORS = [
  "M370.726 113.543 L378.221 108.439 L377.904 107.969 L370.406 113.078 Z",
  "M429.422 134.661 L424.071 127.339 L423.614 127.675 L428.965 134.994 Z",
  "M433.162 198.497 L428.765 206.429 L429.262 206.703 L433.659 198.775 Z",
];
const MIRROR_LABELS: [number, number][] = [
  [366.5, 105.5],
  [434.5, 125.5],
  [440, 209],
];
const MIRROR_DELAYS = [2.35, 1.5, 0.7];
const OBSERVER = { x: 374.496, y: 161.781 };
const ARTWORK = "M394.027 217.208 L398.827 222.008 L394.027 226.808 L389.227 222.008 Z";

type Box = { x: number; y: number; w: number; h: number };

/** Plan sous le tracé : next/image (formats optimisés) recadré comme la vue SVG. */
function PlanBackground({ image, view, plan }: { image: ImageAsset; view: Box; plan: Box }) {
  return (
    <Image
      src={image.src}
      alt=""
      width={image.width}
      height={image.height}
      sizes={`${Math.round((plan.w / view.w) * 100)}vw`}
      className={styles.plan}
      style={{
        width: `${(plan.w / view.w) * 100}%`,
        height: `${(plan.h / view.h) * 100}%`,
        left: `${((plan.x - view.x) / view.w) * 100}%`,
        top: `${((plan.y - view.y) / view.h) * 100}%`,
      }}
    />
  );
}

function Frame({
  head,
  title,
  ratio,
  children,
  caption,
}: {
  head: string;
  title: string;
  ratio: string;
  children: ReactNode;
  caption: ReactNode;
}) {
  return (
    <figure className={styles.frame} data-reveal="">
      <div className={styles.head}>
        <span>{head}</span>
        <b>{title}</b>
      </div>
      <div className={styles.canvas} style={{ aspectRatio: ratio }}>
        {children}
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}

function Replay({ label, text, onClick }: { label: string; text: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.replay} aria-label={label} onClick={onClick}>
      <span aria-hidden="true">↻</span>
      {text}
    </button>
  );
}

/** Réseau des guirlandes (site actuel) : tracés qui se déploient depuis l’espace central. */
export function GarlandNetwork({
  image,
  content,
}: {
  image: ImageAsset;
  content: { head: string; title: string; key: string; text: string; replay: string; replayLabel: string; aria: string };
}) {
  const [run, setRun] = useState(0);
  const view = `${GARLAND_VIEW.x} ${GARLAND_VIEW.y} ${GARLAND_VIEW.w} ${GARLAND_VIEW.h}`;
  return (
    <Frame
      head={content.head}
      title={content.title}
      ratio={`${GARLAND_VIEW.w} / ${GARLAND_VIEW.h}`}
      caption={
        <>
          <span className={styles.key}>
            <i className={styles.keyLine} aria-hidden="true" />
            {content.key}
          </span>
          <span className={styles.captionText}>{content.text}</span>
          <Replay label={content.replayLabel} text={content.replay} onClick={() => setRun((n) => n + 1)} />
        </>
      }
    >
      <PlanBackground image={image} view={GARLAND_VIEW} plan={GARLAND_PLAN} />
      <svg key={run} viewBox={view} className={styles.svg} role="img" aria-label={content.aria}>
        {GARLAND_ROUTES.map((d, i) => (
          <g key={i}>
            <path d={d} pathLength={1} className={styles.routeHalo} style={{ animationDelay: `${GARLAND_DELAYS[i]}s` }} />
            <path d={d} pathLength={1} className={styles.routeLine} style={{ animationDelay: `${GARLAND_DELAYS[i]}s` }} />
          </g>
        ))}
        {GARLAND_ANCHORS.map(([x, y], i) => (
          <g key={i} className={styles.anchor} style={{ animationDelay: `${i % 2 ? 3.8 : 3.65}s` }}>
            <circle cx={x} cy={y} r={8} className={styles.anchorHalo} />
            <circle cx={x} cy={y} r={3.4} className={styles.anchorDot} />
            <text x={x} y={y - 13} className={styles.anchorText}>
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/** Tracé de réflexion (site actuel) : le regard rebondit sur les trois miroirs jusqu’à l’œuvre. */
export function MirrorPlan({
  image,
  content,
}: {
  image: ImageAsset;
  content: {
    head: string;
    title: string;
    aria: string;
    observer: string;
    mirrors: string;
    artwork: string;
    replay: string;
    replayLabel: string;
  };
}) {
  const [run, setRun] = useState(0);
  const view = `${MIRROR_VIEW.x} ${MIRROR_VIEW.y} ${MIRROR_VIEW.w} ${MIRROR_VIEW.h}`;
  return (
    <Frame
      head={content.head}
      title={content.title}
      ratio={`${MIRROR_VIEW.w} / ${MIRROR_VIEW.h}`}
      caption={
        <>
          <span className={styles.legend}>
            <span className={styles.key}>
              <i className={styles.observerKey} aria-hidden="true" />
              {content.observer}
            </span>
            <span className={styles.key}>
              <i className={styles.mirrorKey} aria-hidden="true" />
              {content.mirrors}
            </span>
            <span className={styles.key}>
              <i className={styles.artworkKey} aria-hidden="true" />
              {content.artwork}
            </span>
          </span>
          <Replay label={content.replayLabel} text={content.replay} onClick={() => setRun((n) => n + 1)} />
        </>
      }
    >
      <PlanBackground image={image} view={MIRROR_VIEW} plan={MIRROR_PLAN} />
      <svg key={run} viewBox={view} className={styles.svg} role="img" aria-label={content.aria}>
        <path d={MIRROR_ROUTE} pathLength={1} className={`${styles.reflection} ${styles.reflectionHalo}`} />
        <path d={MIRROR_ROUTE} pathLength={1} className={styles.reflection} />
        {MIRRORS.map((d, i) => (
          <path key={d} d={d} className={styles.mirror} style={{ animationDelay: `${MIRROR_DELAYS[i]}s` }} />
        ))}
        {MIRROR_LABELS.map(([x, y], i) => (
          <g key={i} className={styles.mirrorLabel} style={{ animationDelay: `${MIRROR_DELAYS[i] + 0.1}s` }}>
            <circle cx={x} cy={y} r={3.7} />
            <text x={x} y={y + 1.3}>
              {i + 1}
            </text>
          </g>
        ))}
        <circle cx={OBSERVER.x} cy={OBSERVER.y} r={4} className={styles.observerRing} />
        <circle cx={OBSERVER.x} cy={OBSERVER.y} r={1.25} className={styles.observerCore} />
        <path d={ARTWORK} className={styles.artwork} />
      </svg>
    </Frame>
  );
}
