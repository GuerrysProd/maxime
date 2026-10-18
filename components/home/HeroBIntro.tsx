import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import type { Home, Site } from "@/lib/content";
import styles from "./HeroBIntro.module.css";

/** Accroche du hero B : titre serif sur fond Lin. */
export function HeroBIntro({ site, hero, titleId }: { site: Site; hero: Home["hero"]; titleId: string }) {
  return (
    <>
      <p className={`meta muted ${styles.in}`}>
        <span className={styles.desktopOnly}>{site.identity.eyebrow}</span>
        <span className={styles.mobileOnly}>{site.identity.eyebrowShort}</span>
      </p>
      <h1 id={titleId} className={`serif ${styles.title} ${styles.in}`} style={{ animationDelay: "200ms" }}>
        {site.identity.taglineLines.map((line, i) => (
          <span key={i} className={styles.line}>
            {line}
          </span>
        ))}
      </h1>
      <p className={`${styles.lead} ${styles.in}`} style={{ animationDelay: "280ms" }}>
        {site.identity.subtitle}
      </p>
      <div className={`${styles.actions} ${styles.in}`} style={{ animationDelay: "360ms" }}>
        <Button href={site.primaryCta.href}>{site.primaryCta.label}</Button>
        <ArrowLink href={hero.projectsLink.href} direction="none">
          {hero.projectsLink.label}
        </ArrowLink>
      </div>
    </>
  );
}
