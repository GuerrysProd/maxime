"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import type { ImageAsset } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import styles from "./ProjectIndex.module.css";

export interface IndexItem {
  slug: string;
  number: string;
  name: string;
  place: string;
  href: string;
  preview: ImageAsset;
}

const ROW = 54;
const PREVIEW_HALF = 70;

/**
 * Index des projets du hero d’origine (brief §6). Survol ou focus d’une ligne : la ligne se décale
 * et un aperçu 208 × 140 suit le curseur verticalement (inertie 0,5 s). L’aperçu est décoratif ;
 * nom, lieu et lien restent lisibles sans survol. Mobile : rangée de puces défilante, sans aperçu.
 */
export function ProjectIndex({ items }: { items: IndexItem[] }) {
  const [active, setActive] = useState<number | null>(0);
  const [y, setY] = useState(ROW / 2);
  const listRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !listRef.current) return;
    const box = listRef.current.getBoundingClientRect();
    setY(Math.max(0, Math.min(box.height, event.clientY - box.top)));
  };

  return (
    <>
      <div
        ref={listRef}
        className={styles.list}
        onPointerMove={onPointerMove}
        onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
      >
        <div className={styles.preview} aria-hidden="true" data-visible={active !== null || undefined} style={{ top: y - PREVIEW_HALF }}>
          {items.map((item, index) => (
            <Image
              key={item.slug}
              src={item.preview.src}
              alt=""
              width={208}
              height={140}
              sizes="208px"
              className={styles.previewImage}
              data-on={index === active || undefined}
              style={{ objectPosition: item.preview.position }}
            />
          ))}
        </div>
        <ul>
          {items.map((item, index) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className={styles.row}
                data-active={index === active || undefined}
                onPointerEnter={(event) => event.pointerType === "mouse" && setActive(index)}
                onFocus={() => {
                  setActive(index);
                  setY(index * ROW + ROW / 2);
                }}
              >
                <span className={styles.number}>{item.number}</span>
                <span className={styles.text}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.place}>{item.place}</span>
                </span>
                <Icon name="arrow-up-right" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <ul className={styles.chips}>
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={item.href} className={styles.chip}>
              <span>{item.number}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
