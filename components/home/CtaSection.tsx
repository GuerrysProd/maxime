import Link from "next/link";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { DraftText } from "@/components/ui/DraftText";
import { contactHref, getDecorativeImage, type Home, type Site, type Ui } from "@/lib/content";
import { Frieze } from "./Frieze";
import styles from "./CtaSection.module.css";

/** Bandeau « Parlons de votre projet. » (brief §5-6) : puces → /contact?type=…, frise d’images. */
export function CtaSection({ home, site, ui }: { home: Home["cta"]; site: Site; ui: Ui }) {
  const { phone } = site.contact;
  return (
    <section className={`${styles.section} on-dark`} aria-labelledby="contact-titre" data-cta-section>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.head} data-reveal="">
          <p className="meta muted">
            {home.number} — {home.label}
          </p>
          <h2 id="contact-titre" className={`serif ${styles.title}`}>
            {home.title}
          </h2>
          <p className={styles.lead}>{home.intro}</p>
        </div>

        <div className={styles.chipsBlock} data-reveal="">
          <p className="meta muted">{home.chipsLabel}</p>
          <ul className={styles.chips}>
            {site.ctaChips.map((chip) => (
              <li key={chip.type}>
                <Link className={styles.chip} href={contactHref(chip.type)}>
                  <span className={styles.desktopOnly}>{chip.label}</span>
                  <span className={styles.mobileOnly}>{chip.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions} data-reveal="">
          <Button href={site.primaryCta.href} variant="light" size="lg" icon="arrow-right" className={styles.button}>
            {site.primaryCta.label}
          </Button>
          <ArrowLink href={phone.href} direction="none">
            {home.callPrefix}&nbsp;
            <DraftText value={{ value: phone.value, draft: phone.draft, missing: false }} className="nowrap" />
          </ArrowLink>
        </div>
      </div>

      <Frieze images={home.frieze.map(getDecorativeImage)} labels={{ pause: ui.friezePause, play: ui.friezePlay }} />
    </section>
  );
}
