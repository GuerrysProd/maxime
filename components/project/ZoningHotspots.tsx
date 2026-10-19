"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { ChapterBlock } from "@/lib/content";
import styles from "./ZoningHotspots.module.css";

type ZoningBlock = Extract<ChapterBlock, { type: "zoning" }>;
type Mask = { width: number; height: number; data: Uint8Array };

const MASK_WIDTH = 640;
const OVERVIEW = "overview";
const OPEN = "open";

/** Pixels orange des calques de zonage (même règle que le site actuel). */
const isOrange = (r: number, g: number, b: number, a: number) =>
  a > 30 && r > 155 && g > 20 && g < 180 && b < 125 && r - g > 52;

async function buildMask(src: string): Promise<Mask> {
  const image = new window.Image();
  image.decoding = "async";
  image.src = `/_next/image?url=${encodeURIComponent(src)}&w=${MASK_WIDTH}&q=75`;
  await image.decode();
  const width = MASK_WIDTH;
  const height = Math.round((width * image.naturalHeight) / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas");
  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const data = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 1, p += 4) {
    data[i] = isOrange(pixels[p], pixels[p + 1], pixels[p + 2], pixels[p + 3]) ? 1 : 0;
  }
  return { width, height, data };
}

function hits(mask: Mask | undefined, x: number, y: number) {
  if (!mask || x < 0 || y < 0 || x > 1 || y > 1) return false;
  const cx = Math.round(x * (mask.width - 1));
  const cy = Math.round(y * (mask.height - 1));
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const sx = cx + dx;
      const sy = cy + dy;
      if (sx >= 0 && sy >= 0 && sx < mask.width && sy < mask.height && mask.data[sy * mask.width + sx]) return true;
    }
  }
  return false;
}

/**
 * Zonage interactif (Bâtiment S, SOURCES-REELLES §4) : survoler le bâtiment ouvre le pôle
 * sous le pointeur ; chaque pôle est aussi un bouton (clavier, toucher). Le texte du pôle
 * actif est annoncé (aria-live) : aucune information n’est réservée au survol.
 */
export function ZoningHotspots({
  block,
  labels,
}: {
  block: ZoningBlock;
  labels: { stage: string; hint: string; zones: string; reset: string };
}) {
  const [active, setActive] = useState<string>(OVERVIEW);
  const masks = useRef(new Map<string, Mask>());
  const stageRatio = block.open.width / block.open.height;

  useEffect(() => {
    let cancelled = false;
    for (const zone of block.zones) {
      buildMask(zone.layer.src)
        .then((mask) => !cancelled && masks.current.set(zone.id, mask))
        .catch(() => undefined); // sans masque, les boutons restent utilisables
    }
    return () => {
      cancelled = true;
    };
  }, [block.zones]);

  const zoneAt = (x: number, y: number) => {
    for (const zone of block.zones) {
      let zx = x;
      let zy = y;
      if (zone.box) {
        const width = zone.box.width / 100;
        const height = (width * stageRatio * zone.layer.height) / zone.layer.width;
        zx = (x - zone.box.left / 100) / width;
        zy = (y - zone.box.top / 100) / height;
      }
      if (hits(masks.current.get(zone.id), zx, zy)) return zone.id;
    }
    return OPEN;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const next = zoneAt((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
    if (next !== active) setActive(next);
  };

  const current = block.zones.find((zone) => zone.id === active);
  const copy = current ?? (active === OPEN ? block.openState : block.overview);

  return (
    <div className={styles.zoning}>
      <div
        className={styles.stage}
        style={{ aspectRatio: `${block.open.width} / ${block.open.height}` }}
        onPointerMove={onPointerMove}
        onPointerLeave={(event) => event.pointerType === "mouse" && setActive(OVERVIEW)}
        role="group"
        aria-label={labels.stage}
      >
        <div className={styles.layer} data-on={active === OVERVIEW || undefined}>
          <Image src={block.closed.src} alt={block.closed.alt} fill sizes="(max-width: 900px) 100vw, 66vw" />
        </div>
        <div className={styles.layer} data-on={active === OPEN || undefined} aria-hidden="true">
          <Image src={block.open.src} alt="" fill sizes="(max-width: 900px) 100vw, 66vw" />
        </div>
        {block.zones.map((zone) => (
          <div
            key={zone.id}
            className={styles.layer}
            data-on={active === zone.id || undefined}
            aria-hidden="true"
            style={
              zone.box
                ? {
                    left: `${zone.box.left}%`,
                    top: `${zone.box.top}%`,
                    width: `${zone.box.width}%`,
                    right: "auto",
                    bottom: "auto",
                    aspectRatio: `${zone.layer.width} / ${zone.layer.height}`,
                  }
                : undefined
            }
          >
            <Image src={zone.layer.src} alt="" fill sizes="(max-width: 900px) 100vw, 66vw" />
          </div>
        ))}
      </div>

      <div className={styles.side}>
        <div className={styles.copy} aria-live="polite">
          <p className="meta muted">{copy.label}</p>
          <h3 className={`serif ${styles.title}`}>{copy.title}</h3>
          <p className={styles.text}>{copy.text}</p>
        </div>
        <p className={`meta muted ${styles.hint}`}>{labels.hint}</p>
        <ul className={styles.zones} aria-label={labels.zones}>
          {block.zones.map((zone) => (
            <li key={zone.id}>
              <button
                type="button"
                className={styles.zone}
                aria-pressed={active === zone.id}
                onClick={() => setActive(zone.id)}
                onFocus={() => setActive(zone.id)}
                onPointerEnter={(event) => event.pointerType === "mouse" && setActive(zone.id)}
              >
                {zone.title}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={styles.zone}
              data-reset=""
              aria-pressed={active === OVERVIEW}
              onClick={() => setActive(OVERVIEW)}
            >
              {labels.reset}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
