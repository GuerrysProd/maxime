import { Picture } from "@/components/media/Picture";
import type { Home, Site } from "@/lib/content";
import styles from "./Territories.module.css";

/** 06 — Territoires : Méditerranée et Alpes, deux images plein cadre sous voile. */
export function Territories({ home, territories }: { home: Home["territories"]; territories: Site["territories"] }) {
  return (
    <section className={`${styles.section} on-dark`} aria-labelledby="territoires-titre">
      {territories.map((territory, index) => (
        <article key={territory.id} className={styles.article} data-first={index === 0 || undefined}>
          <Picture image={territory.image} sizes="(max-width: 900px) 100vw, 50vw" parallax={0.04} />
          <div className={styles.veil} aria-hidden="true" />
          {index === 0 && (
            <div className={styles.head} data-reveal="">
              <p className="meta">
                {home.number} — {home.label}
              </p>
              <h2 id="territoires-titre" className={`serif ${styles.title}`}>
                {home.title}
              </h2>
            </div>
          )}
          <div className={styles.body} data-reveal="">
            <h3 className={`serif ${styles.name}`}>{territory.name}</h3>
            <p className="meta">{territory.places.join(" · ")}</p>
            <p className={styles.text}>{territory.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
