import { DraftText } from "@/components/ui/DraftText";
import type { Site } from "@/lib/content";
import styles from "./Parcours.module.css";

/** Parcours & partenaires (bandeau). Infos sourcées mais à valider : affichées en brouillon. */
export function Parcours({ label, items }: { label: string; items: Site["parcours"] }) {
  return (
    <section className={styles.section} aria-labelledby="parcours-titre">
      <div className={`wrap ${styles.inner}`}>
        <h2 id="parcours-titre" className="meta muted">
          {label}
        </h2>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item} data-reveal="">
              <span className={`serif ${styles.name}`}>{item.shortName}</span>
              <span className={`meta muted ${styles.meta}`}>
                <DraftText value={{ value: `${item.kind} · ${item.place}`, draft: item.draft, missing: false }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
