import Image from "next/image";
import Link from "next/link";
import { getDecorativeImage, getObjects, getProjects, getSite, getUi, projectHref } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Brand";
import { HeaderShell } from "./HeaderShell";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";

export type HeaderVariant = "overlay" | "solid" | "dark" | "split";

/**
 * Menu principal (brief §5). « Démarrer un projet » toujours visible ; devient compact
 * (fond Lin, ombre, bouton plein cacao) après 80 px de défilement.
 * - overlay : sur une image sombre (hero d’origine)
 * - split : hero B — navigation sur Lin à gauche, actions sur l’image à droite
 * - solid / dark : pages sans hero image
 */
export function SiteHeader({ variant = "solid", current }: { variant?: HeaderVariant; current?: string }) {
  const site = getSite();
  const ui = getUi();
  const counts = { projects: getProjects().items.length, objects: getObjects().length };
  const featured = site.featured;
  const featuredImage = getDecorativeImage(featured.image.src);

  const brand = (tone: "beige" | "cacao") => (
    <span className={styles.brandTone} data-tone={tone}>
      <Logo kind="monogram" tone={tone} width={60} className={styles.monogram} preload />
      <Logo kind="wordmark" tone={tone} height={21} className={styles.wordmark} preload />
    </span>
  );

  return (
    <HeaderShell
      variant={variant}
      labels={{ open: ui.openMenu, close: ui.closeMenu }}
      menu={
        <MobileMenu
          closeLabel={ui.closeMenu}
          title={ui.menu}
          brand={
            <Link href="/" className={styles.menuBrand} aria-label={ui.homeLabel}>
              <Logo kind="monogram" tone="beige" width={44} />
              <Logo kind="wordmark" tone="beige" height={16} />
            </Link>
          }
        >
          <nav aria-label={ui.menu} className={styles.menuNav}>
            <ul>
              {site.menu.map((item, index) => (
                <li key={item.id}>
                  <Link className={styles.menuRow} href={item.href} aria-current={item.id === current ? "page" : undefined}>
                    <span className={styles.menuNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    {item.count && (
                      <span className={styles.menuCount}>{String(counts[item.count]).padStart(2, "0")}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link className={styles.featured} href={projectHref(featured.project)}>
            <Image
              src={featuredImage.src}
              alt=""
              width={84}
              height={56}
              sizes="84px"
              className={styles.featuredImage}
              placeholder={featuredImage.blurDataURL ? "blur" : "empty"}
              blurDataURL={featuredImage.blurDataURL}
            />
            <span>
              <span className={`meta ${styles.featuredLabel}`}>{featured.label}</span>
              <span className={styles.featuredTitle}>{featured.title}</span>
            </span>
          </Link>
          <div className={styles.menuSpacer} />
          <div className={styles.menuFooter}>
            <Button href={site.primaryCta.href} variant="light" block>
              {site.primaryCta.label}
            </Button>
            <div className={styles.menuMeta}>
              <ul className={styles.menuSocials}>
                {site.contact.socials.map((social) => (
                  <li key={social.label}>
                    {social.href ? (
                      <a href={social.href}>{social.label}</a>
                    ) : (
                      <span className={styles.pendingLink}>
                        {social.label}
                        <span className="sr-only"> ({ui.missingLink})</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <LangSwitch />
            </div>
          </div>
        </MobileMenu>
      }
    >
      <Link href="/" className={styles.brand} aria-label={ui.homeLabel}>
        {brand("beige")}
        {brand("cacao")}
      </Link>
      <nav aria-label={ui.mainNav} className={styles.nav}>
        <ul>
          {site.nav.map((item) => (
            <li key={item.id}>
              <Link className={styles.navLink} href={item.href} aria-current={item.id === current ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.actions}>
        <LangSwitch className={styles.lang} />
        <Link className={styles.cta} href={site.primaryCta.href} aria-current={current === "contact" ? "page" : undefined}>
          {site.primaryCta.label}
        </Link>
      </div>
    </HeaderShell>
  );
}
