import Link from "next/link";
import { getSite, getUi } from "@/lib/content";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { DraftText } from "@/components/ui/DraftText";
import { Logo } from "./Brand";
import { LangSwitch } from "./LangSwitch";
import styles from "./SiteFooter.module.css";

export const TOP_ID = "haut";

/** Pied de page : nom géant, navigation, coordonnées, FR / EN (brief §5). */
export function SiteFooter() {
  const site = getSite();
  const ui = getUi();
  const { contact } = site;

  const contactLink = (item: typeof contact.phone, wrap: "nowrap" | "anywhere") => (
    <a href={item.href} className={`${styles.link} ${wrap === "nowrap" ? "nowrap" : styles.breakable}`}>
      <DraftText value={{ value: item.value, draft: item.draft, missing: false }} />
    </a>
  );

  const socials = contact.socials.map((social) => (
    <li key={social.label}>
      {social.href ? (
        <a className={styles.link} href={social.href}>
          {social.label}
        </a>
      ) : (
        <span className={styles.link}>
          <DraftText value={{ value: social.label, draft: false, missing: true }} />
          <span className="sr-only"> ({ui.missingLink})</span>
        </span>
      )}
    </li>
  ));

  return (
    <footer className={styles.footer} data-site-footer>
      <div className="wrap">
        <div className={styles.columns}>
          <div className={styles.intro}>
            <Logo kind="monogram" tone="cacao" width={80} className={styles.monogram} />
            <p className="muted">{site.identity.subtitle}</p>
            <Button href={site.primaryCta.href} className={styles.desktopOnly}>
              {site.primaryCta.label}
            </Button>
          </div>

          <nav aria-label={ui.footerNav} className={styles.explore}>
            <p className="meta muted">{ui.explore}</p>
            <ul>
              {site.footerNav.map((item) => (
                <li key={item.id}>
                  <Link className={styles.link} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <p className="meta muted">{ui.contact}</p>
            <address>
              <span className={styles.line}>
                <DraftText value={contact.address} />
              </span>
              <span className={styles.line}>{contact.region}</span>
              {contactLink(contact.phone, "nowrap")}
              {contactLink(contact.email, "anywhere")}
            </address>
            <ul className={styles.mobileOnly}>{socials}</ul>
          </div>

          <div className={`${styles.follow} ${styles.desktopOnly}`}>
            <p className="meta muted">{ui.follow}</p>
            <ul>{socials}</ul>
            <LangSwitch className={styles.lang} />
          </div>
        </div>

        <div className={`${styles.mobileRow} ${styles.mobileOnly}`}>
          <LangSwitch />
          <ArrowLink href={`#${TOP_ID}`} direction="none">
            {ui.backToTop}
          </ArrowLink>
        </div>

        <Logo
          kind="wordmark"
          tone="cacao"
          width={1280}
          alt={site.identity.name}
          sizes="(max-width: 1440px) 100vw, 1280px"
          className={styles.wordmark}
        />

        <div className={styles.bottom}>
          <p className="meta muted">{site.identity.copyright}</p>
          <nav aria-label={ui.legalNav}>
            <ul className={styles.legal}>
              {site.legalNav.map((item) => (
                <li key={item.id}>
                  <Link className={styles.link} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
