import Link from "next/link";
import type { CSSProperties } from "react";
import { CtaCompact } from "@/components/home/CtaCompact";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { Method } from "@/components/home/Method";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { contactHref, getFaq, getPages, getServices } from "@/lib/content";
import styles from "./ServicesPage.module.css";

/** Services & méthode (aperçu 08) : cinq offres, méthode, zones d’intervention, FAQ. */
export function ServicesPage() {
  const { services: page } = getPages();
  const { offers, method } = getServices();
  const faq = getFaq();

  return (
    <>
      <SiteHeader variant="solid" current="services" />
      <main id={MAIN_ID} className={styles.main}>
        <header className={`wrap g12 ${styles.header}`}>
          <div className={styles.titleBlock}>
            <p className="meta muted">{page.eyebrow}</p>
            <h1 className={`serif ${styles.title}`}>{page.title}</h1>
            <p className={styles.lead}>{page.intro}</p>
          </div>
          <nav aria-label={page.offersNav} className={styles.anchors}>
            <ol>
              {offers.map((offer) => (
                <li key={offer.id}>
                  <Link href={`#${offer.id}`} className={styles.anchor}>
                    <span className="meta muted">{offer.number}</span>
                    <span className={styles.anchorTitle}>{offer.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <section className={`wrap ${styles.offers}`} aria-labelledby="offres-titre">
          <div className={styles.offersHead}>
            <h2 id="offres-titre" className="meta muted">
              {page.offersTitle}
            </h2>
            <p className="meta muted">{page.offersNote}</p>
          </div>
          {offers.map((offer) => (
            <article key={offer.id} id={offer.id} className={styles.offer} aria-labelledby={`${offer.id}-titre`} data-reveal="">
              <p className={`serif ${styles.offerNumber}`} aria-hidden="true">
                {offer.number}
              </p>
              <div className={styles.offerMain}>
                <h3 id={`${offer.id}-titre`} className={`serif ${styles.offerTitle}`}>
                  {offer.title}
                </h3>
                <p className={styles.offerSummary}>{offer.summary}</p>
                <p className="meta muted">
                  {page.forLabel} {offer.audience.join(" · ")}
                </p>
                <ArrowLink href={contactHref(offer.contactType)}>{page.offerCta}</ArrowLink>
              </div>
              <div className={styles.offerDeliverables}>
                <p className="meta muted">{page.deliverablesLabel}</p>
                <ul>
                  {offer.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.offerImage}>
                <Picture image={offer.image} sizes="(max-width: 900px) 40vw, 15vw" />
              </div>
            </article>
          ))}
        </section>

        <Method home={page.method} steps={method} receiveLabel={page.method.receive} id="methode" />

        <section className={styles.zones} aria-labelledby="zones-titre">
          <div className={`wrap g12 ${styles.zonesGrid}`}>
            <div className={styles.zonesText}>
              <p className="meta muted">{page.zones.label}</p>
              <h2 id="zones-titre" className={`serif ${styles.zonesTitle}`}>
                {page.zones.title}
              </h2>
              <p className={styles.zonesLead}>{page.zones.text}</p>
              <ol aria-label={page.zones.listLabel} className={styles.places}>
                {page.zones.places.map((place) => (
                  <li key={place.name}>
                    <span className={styles.placeDot} data-tone={place.tone} aria-hidden="true" />
                    <span>{place.name}</span>
                    <span className="meta muted">{place.region}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.zonesImages}>
              {page.zones.images.map((item, index) => (
                <figure key={item.caption} style={{ "--offset": index % 2 ? "72px" : "0px" } as CSSProperties}>
                  <div className={styles.zoneImage}>
                    <Picture image={item.image} sizes="(max-width: 900px) 50vw, 25vw" />
                  </div>
                  <figcaption className="meta muted">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-titre">
          <div className={`wrap g12 ${styles.faqGrid}`}>
            <div className={styles.faqIntro} data-reveal="">
              <p className="meta muted">{page.faq.label}</p>
              <h2 id="faq-titre" className={`serif ${styles.faqTitle}`}>
                {page.faq.title}
              </h2>
              <ArrowLink href={page.faq.link.href}>{page.faq.link.label}</ArrowLink>
            </div>
            <div className={styles.faqList}>
              <FaqAccordion items={faq} />
            </div>
          </div>
        </section>

        <CtaCompact />
      </main>
    </>
  );
}
