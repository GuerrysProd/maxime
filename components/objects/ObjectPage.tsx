import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { MediaSlot } from "@/components/media/MediaSlot";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Button } from "@/components/ui/Button";
import { DraftText, toDraft } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import {
  contactHref,
  getHome,
  getObjects,
  getPages,
  getProject,
  getSite,
  objectHref,
  projectHref,
  type ImageAsset,
  type ObjectPiece,
} from "@/lib/content";
import { fill } from "@/lib/typo";
import { ObjectSpecs } from "./ObjectSpecs";
import styles from "./ObjectPage.module.css";

const imageOf = (item: ObjectPiece["media"][number]): ImageAsset => (item.type === "image" ? item.image : item.poster);

/** Fiche d’une pièce (aperçu 06b) : média (prêt pour la 3D), fiche technique, histoire, croquis, lieu. */
export function ObjectPage({ piece }: { piece: ObjectPiece }) {
  const { object: labels } = getPages();
  const site = getSite();
  const { cta } = getHome();
  const all = getObjects();
  const index = all.findIndex((item) => item.slug === piece.slug);
  const others = [1, 2, 3].map((offset) => all[(index + offset) % all.length]).filter((item) => item.slug !== piece.slug);
  const project = piece.project ? getProject(piece.project) : undefined;
  const [main, ...more] = piece.media;
  const inSitu = piece.inSitu ?? (project ? { image: project.hero, caption: undefined, fit: "cover" as const } : undefined);
  const request = `${contactHref("objet")}&piece=${encodeURIComponent(piece.slug)}`;

  return (
    <>
      <SiteHeader variant="dark" current="objets" />
      <main id={MAIN_ID} className={styles.main}>
        <div className={`${styles.dark} on-dark`}>
          <div className={`wrap ${styles.topline}`}>
            <Link href="/objets" className={`meta muted ${styles.back}`}>
              <Icon name="arrow-left" size={14} />
              {labels.back}
            </Link>
            <p className="meta muted">{fill(labels.position, { n: piece.number, total: String(all.length).padStart(2, "0") })}</p>
          </div>

          <header className={`wrap g12 ${styles.header}`}>
            <figure className={styles.figure}>
              <MediaSlot item={main} sizes="(max-width: 900px) 100vw, 58vw" preload />
            </figure>
            <div className={styles.intro}>
              <p className="meta muted">{piece.type}</p>
              <h1 className={`serif ${styles.title}`}>{piece.name}</h1>
              {piece.summary && (
                <p className={styles.summary}>
                  <DraftText value={toDraft(piece.summary)} />
                </p>
              )}
              <ObjectSpecs piece={piece} />
              <div className={styles.actions}>
                <Button href={request} variant="light">
                  {labels.request}
                </Button>
                {project && <ArrowLink href={projectHref(project.slug)}>{labels.viewProject}</ArrowLink>}
              </div>
            </div>
          </header>

          {piece.story && (
            <section className={`wrap g12 ${styles.story}`} aria-labelledby="histoire-titre">
              <div className={styles.storyHead}>
                {piece.storyTitle ? (
                  <>
                    <p className="meta muted">{labels.story}</p>
                    <h2 id="histoire-titre" className={`serif ${styles.storyTitle}`}>
                      {piece.storyTitle}
                    </h2>
                  </>
                ) : (
                  <h2 id="histoire-titre" className="meta muted">
                    {labels.story}
                  </h2>
                )}
              </div>
              <div className={styles.storyText} data-reveal="">
                {piece.story.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        {(piece.sketch || more.length > 0) && (
          <section className={styles.light} aria-labelledby="vues-titre">
            <div className="wrap">
              <div className={styles.lightHead}>
                <h2 id="vues-titre" className={`serif ${styles.lightTitle}`}>
                  {piece.sketch ? labels.sketchTitle : labels.galleryTitle}
                </h2>
                {piece.sketch && <p className="meta muted">{labels.sketchMeta}</p>}
              </div>
              <div className={styles.gallery} data-count={piece.sketch ? 2 : more.length}>
                {piece.sketch && (
                  <figure className={styles.galleryItem}>
                    <div className={styles.sketch}>
                      <Image
                        src={piece.sketch.src}
                        alt={piece.sketch.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 50vw"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <figcaption className="meta muted">01 — {labels.sketchCaption}</figcaption>
                  </figure>
                )}
                {(piece.sketch ? [main] : more).map((item, i) => (
                  <figure key={i} className={styles.galleryItem}>
                    <div className={styles.galleryMedia}>
                      <Picture image={imageOf(item)} sizes="(max-width: 900px) 100vw, 50vw" />
                    </div>
                    {piece.sketch && <figcaption className="meta muted">02 — {labels.pieceCaption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {inSitu && (
          <figure className={styles.inSitu}>
            <Picture image={inSitu.image} sizes="100vw" parallax={0.06} />
            <div className={styles.inSituVeil} aria-hidden="true" />
            <figcaption className={`wrap ${styles.inSituCaption}`}>
              <div>
                <p className="meta">{labels.inSitu}</p>
                <p className={`serif ${styles.inSituTitle}`}>
                  {inSitu.caption ?? (project ? `${project.name}, ${project.place}` : "")}
                </p>
              </div>
              {project && <ArrowLink href={projectHref(project.slug)}>{labels.viewProject}</ArrowLink>}
            </figcaption>
          </figure>
        )}

        <section className={`${styles.others} on-dark`} aria-labelledby="autres-titre">
          <div className="wrap">
            <div className={styles.othersHead}>
              <h2 id="autres-titre" className={`serif ${styles.othersTitle}`}>
                {labels.others}
              </h2>
              <ArrowLink href="/objets">{labels.allObjects}</ArrowLink>
            </div>
            <ul className={`g12 ${styles.othersList}`}>
              {others.map((other) => {
                const origin = other.project ? getProject(other.project) : undefined;
                return (
                  <li key={other.slug}>
                    <Link href={objectHref(other.slug)} className={styles.otherCard}>
                      <div className={styles.otherMedia}>
                        <Picture image={imageOf(other.media[0])} sizes="(max-width: 900px) 100vw, 33vw" imageClassName={styles.zoom} />
                      </div>
                      <div>
                        <p className={`serif ${styles.otherName}`}>{other.name}</p>
                        <p className="meta muted">{[other.category, origin?.name].filter(Boolean).join(" · ")}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className={styles.custom} aria-labelledby="sur-mesure-titre" data-cta-section>
          <div className={`wrap g12 ${styles.customGrid}`}>
            <div className={styles.customText}>
              <p className="meta muted">{labels.custom.label}</p>
              <h2 id="sur-mesure-titre" className={`serif ${styles.customTitle}`}>
                {labels.custom.title}
              </h2>
            </div>
            <div className={styles.customActions}>
              <Button href={contactHref("objet")}>{site.primaryCta.label}</Button>
              <ArrowLink href={site.contact.phone.href} direction="none">
                {cta.callPrefix}&nbsp;
                <DraftText value={{ value: site.contact.phone.value, draft: site.contact.phone.draft, missing: false }} className="nowrap" />
              </ArrowLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
