import { ArrowLink } from "@/components/ui/ArrowLink";
import type { FaqItem, Home } from "@/lib/content";
import { FaqAccordion } from "./FaqAccordion";
import styles from "./Faq.module.css";

/** 07 — Questions fréquentes (questions marquées « home » dans faq.json). */
export function Faq({ home, items }: { home: Home["faq"]; items: FaqItem[] }) {
  return (
    <section className={styles.section} aria-labelledby="faq-titre">
      <div className={`wrap g12 ${styles.grid}`}>
        <div className={styles.intro} data-reveal="">
          <p className="meta muted">
            {home.number} — {home.label}
          </p>
          <h2 id="faq-titre" className={`serif ${styles.title}`}>
            {home.title}
          </h2>
          <p className={`muted ${styles.introText}`}>{home.intro}</p>
          <ArrowLink href={home.link.href}>{home.link.label}</ArrowLink>
        </div>
        <div className={styles.list} data-reveal="">
          <FaqAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
