import { Logo } from "@/components/layout/Brand";
import { ArrowLink } from "@/components/ui/ArrowLink";
import type { Home, Site } from "@/lib/content";
import styles from "./Manifesto.module.css";

/** 01 — Manifeste. */
export function Manifesto({ site, home }: { site: Site; home: Home["manifesto"] }) {
  return (
    <section className={styles.section} aria-labelledby="manifeste-titre">
      <div className={`wrap g12 ${styles.grid}`}>
        <h2 id="manifeste-titre" className={`meta muted ${styles.label}`} data-reveal="">
          {home.number} — {home.label}
        </h2>
        <p className={`serif ${styles.text}`} data-reveal="">
          {site.identity.manifesto}
        </p>
        <div className={styles.footer} data-reveal="">
          <div className={styles.signature}>
            <Logo kind="monogram" tone="cacao" width={56} className={styles.monogram} />
            <p className="muted">{site.identity.signature}</p>
          </div>
          <ArrowLink href={home.link.href}>{home.link.label}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
