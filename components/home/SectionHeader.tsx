import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

/** En-tête de section : « 02 — Projets sélectionnés », titre serif, texte et lien à droite. */
export function SectionHeader({
  id,
  number,
  label,
  title,
  lead,
  aside,
  asideAlign = "start",
  spacing = "lg",
}: {
  id: string;
  number?: string;
  label: string;
  title: string;
  /** Texte sous le titre, dans la colonne gauche. */
  lead?: ReactNode;
  /** Colonne droite (texte, lien). */
  aside?: ReactNode;
  asideAlign?: "start" | "end";
  spacing?: "md" | "lg" | "xl";
}) {
  return (
    <div className={`g12 ${styles.header}`} data-spacing={spacing} data-aside={asideAlign} data-reveal="">
      <div className={styles.main}>
        <p className="meta muted">{number ? `${number} — ${label}` : label}</p>
        <h2 id={id} className={`serif ${styles.title}`}>
          {title}
        </h2>
        {lead}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}
