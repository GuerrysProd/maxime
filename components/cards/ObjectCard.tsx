import Link from "next/link";
import type { CSSProperties } from "react";
import { objectHref, type ObjectPiece } from "@/lib/content";
import { Picture } from "@/components/media/Picture";
import { Icon } from "@/components/ui/Icon";
import styles from "./ObjectCard.module.css";

/** Carte objet (brief §5) : grande (« feature ») ou vignette. Sur fond cacao par défaut. */
export function ObjectCard({
  piece,
  meta,
  metaExtra,
  variant = "tile",
  tone = "dark",
  sizes,
  noImageLabel,
  revealDelay,
}: {
  piece: ObjectPiece;
  meta: string;
  /** Complément masqué dans la mise en page mobile (ex. « · Pralong »). */
  metaExtra?: string;
  variant?: "feature" | "tile";
  tone?: "dark" | "light";
  sizes: string;
  noImageLabel: string;
  revealDelay?: number;
}) {
  const first = piece.media[0];
  const image = first?.type === "image" ? first.image : first?.poster;
  return (
    <Link
      href={objectHref(piece.slug)}
      className={styles.card}
      data-variant={variant}
      data-tone={tone}
      data-reveal=""
      style={revealDelay ? ({ "--reveal-delay": `${revealDelay}ms` } as CSSProperties) : undefined}
    >
      <div className={styles.media} data-empty={image ? undefined : ""}>
        {image ? (
          <Picture image={image} sizes={sizes} imageClassName={styles.image} />
        ) : (
          <p className="meta">{noImageLabel}</p>
        )}
      </div>
      {variant === "feature" ? (
        <div className={styles.body}>
          <div className={styles.head}>
            <h3 className={`serif ${styles.title}`}>
              <span className={styles.number}>{piece.number} /</span>
              {piece.name}
            </h3>
            <Icon name="arrow-up-right" size={18} className={styles.arrow} />
          </div>
          <p className={`meta ${styles.meta}`}>{meta}</p>
        </div>
      ) : (
        <div>
          <h3 className={`serif ${styles.name}`}>{piece.name}</h3>
          <p className={`meta ${styles.meta} ${styles.small}`}>
            {meta}
            {metaExtra && <span className={styles.extra}>{metaExtra}</span>}
          </p>
        </div>
      )}
    </Link>
  );
}
