import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { DraftText } from "@/components/ui/DraftText";
import { getHome, getPages, getSite, getUi } from "@/lib/content";
import styles from "./CtaCompact.module.css";

/** Bandeau d’appel compact des pages intérieures (aperçus 03 et 05) : sans puces ni frise. */
export function CtaCompact({ type }: { type?: string }) {
  const site = getSite();
  const { cta } = getHome();
  const { phone } = site.contact;
  const href = type ? `${site.primaryCta.href}?type=${encodeURIComponent(type)}` : site.primaryCta.href;
  return (
    <section className={`${styles.section} on-dark`} aria-labelledby="contact-titre" data-cta-section>
      <div className={`wrap g12 ${styles.grid}`}>
        <div className={styles.head} data-reveal="">
          <p className="meta muted">{getUi().contact}</p>
          <h2 id="contact-titre" className={`serif ${styles.title}`}>
            {cta.title}
          </h2>
          <p className={styles.lead}>{getPages().cta.intro}</p>
        </div>
        <div className={styles.actions} data-reveal="">
          <Button href={href} variant="light" size="lg" icon="arrow-right" className={styles.button}>
            {site.primaryCta.label}
          </Button>
          <ArrowLink href={phone.href} direction="none">
            {cta.callPrefix}&nbsp;
            <DraftText value={{ value: phone.value, draft: phone.draft, missing: false }} className="nowrap" />
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
