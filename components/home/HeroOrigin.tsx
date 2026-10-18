import type { CSSProperties } from "react";
import { Logo } from "@/components/layout/Brand";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Home, Site } from "@/lib/content";
import { ProjectIndex, type IndexItem } from "./ProjectIndex";
import styles from "./HeroOrigin.module.css";

export const HERO_TITLE_ID = "hero-titre";

/** Délai d’apparition en cascade (80 ms) des éléments du hero. */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Hero d’origine (écran 01) : image Pralong plein cadre + voiles, accroche à gauche,
 * index des projets à droite sur panneau translucide, nom en très grand en bas.
 */
export function HeroOrigin({
  site,
  hero,
  index,
  countLabel,
}: {
  site: Site;
  hero: Home["hero"];
  index: IndexItem[];
  countLabel: string;
}) {
  return (
    <section className={`${styles.hero} on-dark`} data-hero aria-labelledby={HERO_TITLE_ID}>
      <div className={styles.media}>
        <Picture image={hero.image} sizes="100vw" preload parallax={0.08} parallaxMode="top" />
      </div>
      <div className={styles.veil} aria-hidden="true" />

      <div className={`wrap g12 ${styles.content}`}>
        <div className={styles.intro}>
          <p className={`meta ${styles.eyebrow} ${styles.in}`} style={step(0)}>
            <span className={styles.desktopOnly}>{site.identity.eyebrow}</span>
            <span className={styles.mobileOnly}>{site.identity.eyebrowShort}</span>
          </p>
          <h1 id={HERO_TITLE_ID} className={`serif ${styles.title} ${styles.in}`} style={step(1)}>
            {site.identity.taglineLines.map((line, i) => (
              <span key={i} className={styles.line}>
                {line}
              </span>
            ))}
          </h1>
          <p className={`${styles.lead} ${styles.in}`} style={step(2)}>
            {site.identity.subtitle}
          </p>
          <div className={`${styles.actions} ${styles.in}`} style={step(3)}>
            <Button href={site.primaryCta.href} variant="light" icon="arrow-right" className={styles.ctaButton}>
              {site.primaryCta.label}
            </Button>
            <ArrowLink href={hero.projectsLink.href}>
              <span className={styles.desktopOnly}>{hero.projectsLink.label}</span>
              <span className={styles.mobileOnly}>{hero.projectsLink.labelShort}</span>
            </ArrowLink>
          </div>
        </div>

        <div className={`${styles.index} ${styles.in}`} style={step(4)}>
          <div className={styles.indexHead}>
            <h2 className="meta">{hero.indexTitle}</h2>
            <p className="meta muted">{countLabel}</p>
          </div>
          <ProjectIndex items={index} />
        </div>
      </div>

      <div className={`wrap ${styles.bottom}`}>
        <div className={styles.bottomRow}>
          <p className={`meta ${styles.scroll}`}>
            <Icon name="arrow-down" size={14} />
            {hero.scroll}
          </p>
          <p className="meta">{hero.caption}</p>
        </div>
        <Logo kind="wordmark" tone="beige" width={1280} sizes="(max-width: 1440px) 100vw, 1280px" className={styles.name} />
      </div>
    </section>
  );
}
