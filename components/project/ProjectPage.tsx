import { CtaCompact } from "@/components/home/CtaCompact";
import { ObjectCard } from "@/components/cards/ObjectCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { contactHref, getObjects, getUi, type Project, type ProjectDetail } from "@/lib/content";
import { ChapterBlocks } from "./ChapterBlocks";
import { ChapterNav } from "./ChapterNav";
import { NextProject, pad, ProjectIntro } from "./ProjectShell";
import styles from "./ProjectPage.module.css";

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
        <ProjectIntro project={project} total={total} lead={detail.lead} intro={detail.intro} specs={detail.specs} />

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

        {next && <NextProject next={next} total={total} />}

        <CtaCompact type={detail.similar?.type} />
      </main>
    </>
  );
}
