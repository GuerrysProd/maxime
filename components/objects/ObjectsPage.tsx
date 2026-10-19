import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getObjects, getPages, objectHref, type ObjectPiece } from "@/lib/content";
import { fill } from "@/lib/typo";
import { ObjectSpecs } from "./ObjectSpecs";
import styles from "./ObjectsPage.module.css";

function cover(piece: ObjectPiece) {
  const first = piece.media[0];
  return first.type === "image" ? first.image : first.poster;
}

/** Collection d’objets (aperçu 06), sur fond cacao. */
export function ObjectsPage() {
  const { objects: page } = getPages();
  const [feature, ...others] = getObjects();
  const all = [feature, ...others];

  return (
    <>
      <SiteHeader variant="dark" current="objets" />
      <main id={MAIN_ID} className={styles.main}>
        <div className={`${styles.dark} on-dark`}>
        <header className={`wrap g12 ${styles.header}`}>
          <div className={styles.titleBlock}>
            <p className="meta muted">{fill(page.eyebrow, { n: String(all.length).padStart(2, "0") })}</p>
            <h1 className={`serif ${styles.title}`}>{page.title}</h1>
          </div>
          <p className={styles.intro}>{page.intro}</p>
        </header>

        <div className="wrap">
          <Link href={objectHref(feature.slug)} className={`g12 ${styles.feature}`} data-reveal="">
            <div className={styles.featureMedia}>
              <Picture image={cover(feature)} sizes="(max-width: 900px) 100vw, 50vw" imageClassName={styles.zoom} />
            </div>
            <div className={styles.featureText}>
              <p className="meta muted">
                {feature.number} — {feature.category}
              </p>
              <h2 className={`serif ${styles.featureTitle}`}>{feature.name}</h2>
              {feature.summary && <p className={styles.summary}>{feature.summary}</p>}
              <ObjectSpecs piece={feature} rows={["materials", "project"]} linkProject={false} />
              <span className={styles.more}>
                {page.viewPiece}
                <Icon name="arrow-right" />
              </span>
            </div>
          </Link>

          <ul className={`g12 ${styles.grid}`}>
            {others.map((piece, index) => (
              <li key={piece.slug} className={styles.item} data-reveal="" style={{ "--reveal-delay": `${(index % 3) * 70}ms` } as CSSProperties}>
                <Link href={objectHref(piece.slug)} className={styles.card}>
                  <div className={styles.media}>
                    <Picture image={cover(piece)} sizes="(max-width: 900px) 100vw, 33vw" imageClassName={styles.zoom} />
                  </div>
                  <div className={styles.cardHead}>
                    <h2 className={`serif ${styles.cardTitle}`}>
                      <span className={`meta muted ${styles.number}`}>{piece.number}</span>
                      {piece.name}
                    </h2>
                    <Icon name="arrow-up-right" size={18} className={styles.arrow} />
                  </div>
                  <ObjectSpecs piece={piece} rows={["materials", "project"]} linkProject={false} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        </div>

        <section className={styles.editors} aria-labelledby="editeurs-titre">
          <div className={`wrap g12 ${styles.editorsGrid}`}>
            <div className={styles.editorsText}>
              <p className="meta muted">{page.editors.label}</p>
              <h2 id="editeurs-titre" className={`serif ${styles.editorsTitle}`}>
                {page.editors.title}
              </h2>
              <p>{page.editors.text}</p>
            </div>
            <div className={styles.editorsActions}>
              <Button href={page.editors.cta.href}>{page.editors.cta.label}</Button>
              <ArrowLink href={page.editors.link.href}>{page.editors.link.label}</ArrowLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
