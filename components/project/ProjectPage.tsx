import Link from "next/link";
import { CtaCompact } from "@/components/home/CtaCompact";
import { ObjectCard } from "@/components/cards/ObjectCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { Picture } from "@/components/media/Picture";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { DraftText } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import { MetaLine } from "@/components/ui/MetaLine";
import { StatusTag } from "@/components/ui/StatusTag";
import { fill } from "@/lib/typo";
import {
  contactHref,
  getObjects,
  getUi,
  projectHref,
  type Project,
  type ProjectDetail,
} from "@/lib/content";
import { ChapterBlocks } from "./ChapterBlocks";
import { ChapterNav } from "./ChapterNav";
import styles from "./ProjectPage.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Fiche projet, gabarit « chapitres » (aperçu 03, brief §6). */
export function ProjectPage({
  project,
  detail,
  total,
  next,
}: {
  project: Project;
  detail: ProjectDetail;
  total: number;
  next?: Project;
}) {
  const ui = getUi();
  const pieces = (project.pieces ?? [])
    .map((slug) => getObjects().find((piece) => piece.slug === slug))
    .filter((piece) => piece !== undefined);
  const chapters = detail.chapters.map((chapter, index) => ({ ...chapter, number: pad(index + 1) }));

  return (
    <>
      <SiteHeader variant="solid" current="projets" />
      <main id={MAIN_ID} className={styles.main}>
        <header className={`wrap ${styles.header}`}>
          <div className={styles.topline}>
            <Link href="/projets" className={`meta muted ${styles.back}`}>
              <Icon name="arrow-left" size={14} />
              {ui.allProjects}
            </Link>
            <p className="meta muted">{fill(ui.projectPosition, { n: project.number, total: pad(total) })}</p>
          </div>
          <h1 className={`serif ${styles.title}`}>{project.name}</h1>
          <div className={styles.metaRow}>
            <MetaLine items={project.meta} />
            <StatusTag status={project.status} />
          </div>
        </header>

        <div className={styles.hero}>
          <Picture image={project.hero} sizes="100vw" preload parallax={0.06} parallaxMode="top" />
        </div>

        <section className={styles.presentation} aria-label={ui.specSheet}>
          <div className="wrap g12">
            <div className={styles.lead} data-reveal="">
              <p className={`serif ${styles.leadText}`}>{detail.lead ?? project.summary}</p>
              {detail.intro?.map((text, i) => (
                <p key={i} className={styles.intro}>
                  {text}
                </p>
              ))}
            </div>
            <div className={styles.specs} data-reveal="">
              <h2 className="meta muted">{ui.specSheet}</h2>
              <dl>
                {detail.specs.map((row) => (
                  <div key={row.label} className={styles.spec}>
                    <dt className="meta muted">{row.label}</dt>
                    <dd>{"status" in row ? <StatusTag status={project.status} /> : <DraftText value={row.value} />}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <div className={`wrap g12 ${styles.body}`}>
          <div className={styles.navColumn}>
            <ChapterNav chapters={chapters} title={ui.chapters} label={ui.chaptersNav}>
              {detail.similar && <ArrowLink href={contactHref(detail.similar.type)}>{detail.similar.label}</ArrowLink>}
            </ChapterNav>
          </div>
          <div className={styles.chapters}>
            {chapters.map((chapter) => (
              <section key={chapter.id} id={chapter.id} className={styles.chapter} aria-labelledby={`${chapter.id}-titre`}>
                <div className={styles.chapterHead} data-reveal="">
                  <p className="meta muted">
                    {chapter.number} — {chapter.kicker ?? chapter.label}
                  </p>
                  <h2 id={`${chapter.id}-titre`} className={`serif ${styles.chapterTitle}`}>
                    {chapter.title}
                  </h2>
                </div>
                <ChapterBlocks blocks={chapter.blocks} ui={ui} />
              </section>
            ))}
          </div>
        </div>

        {pieces.length > 0 && (
          <section className={`${styles.pieces} on-dark`} aria-labelledby="pieces-titre" data-reveal="tone">
            <div className="wrap">
              <div className={`g12 ${styles.piecesHead}`}>
                <div>
                  <p className="meta muted">{ui.piecesLabel}</p>
                  <h2 id="pieces-titre" className={`serif ${styles.piecesTitle}`}>
                    {ui.piecesTitle}
                  </h2>
                </div>
                <ArrowLink href="/objets">{ui.allObjects}</ArrowLink>
              </div>
              <ul className={styles.piecesList}>
                {pieces.map((piece) => (
                  <li key={piece.slug}>
                    <ObjectCard
                      piece={piece}
                      variant="feature"
                      meta={piece.category}
                      sizes="(max-width: 900px) 100vw, 33vw"
                      noImageLabel=""
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {next && (
          <section className={styles.next} aria-labelledby="suivant-titre">
            <Link href={projectHref(next.slug)} className={`wrap g12 ${styles.nextCard}`}>
              <div className={styles.nextText}>
                <p className="meta muted">{fill(ui.nextProject, { n: next.number, total: pad(total) })}</p>
                <h2 id="suivant-titre" className={`serif ${styles.nextTitle}`}>
                  {next.name}
                </h2>
                <MetaLine items={next.meta} className="muted" />
                <span className={styles.nextLink}>
                  {ui.viewProject}
                  <Icon name="arrow-right" />
                </span>
              </div>
              <div className={styles.nextMedia}>
                <Picture image={next.cover} sizes="(max-width: 900px) 100vw, 58vw" imageClassName={styles.nextImage} />
              </div>
            </Link>
          </section>
        )}

        <CtaCompact type={detail.similar?.type} />
      </main>
    </>
  );
}
