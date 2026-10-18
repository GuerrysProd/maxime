import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Home, Services } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import styles from "./ServicesList.module.css";

/** 04 — Services : liste numérotée avec flèches. */
export function ServicesList({ home, offers }: { home: Home["services"]; offers: Services["offers"] }) {
  return (
    <section className={styles.section} aria-labelledby="services-titre">
      <div className="wrap">
        <SectionHeader
          id="services-titre"
          number={home.number}
          label={home.label}
          title={home.title}
          aside={<p className="muted">{home.intro}</p>}
          spacing="md"
        />
        <ol className={styles.list}>
          {offers.map((offer, index) => (
            <li key={offer.id} data-reveal="" style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}>
              <Link className={styles.row} href={`${home.href}#${offer.id}`}>
                <span className={`meta muted ${styles.number}`}>{offer.number}</span>
                <span className={`serif ${styles.title}`}>{offer.title}</span>
                <span className={`muted ${styles.summary}`}>{offer.summary}</span>
                <Icon name="arrow-up-right" size={20} className={styles.arrow} />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
