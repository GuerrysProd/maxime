import Link from "next/link";
import type { ReactNode } from "react";
import { Picture } from "@/components/media/Picture";
import { DraftText } from "@/components/ui/DraftText";
import { Icon } from "@/components/ui/Icon";
import { MetaLine } from "@/components/ui/MetaLine";
import { StatusTag } from "@/components/ui/StatusTag";
import { getUi, projectHref, type Project, type SpecRow } from "@/lib/content";
import { fill } from "@/lib/typo";
import styles from "./ProjectPage.module.css";

export const pad = (n: number) => String(n).padStart(2, "0");

/** En-tête, image d’ouverture, présentation et fiche technique : communs aux deux gabarits. */
export function ProjectIntro({
  project,
  total,
  lead,
  intro,
  specs,
  children,
}: {
  project: Project;
  total: number;
  lead?: string;
  intro?: string[];
  specs: SpecRow[];
  /** Sous la présentation (crédit…). */
  children?: ReactNode;
}) {
  const ui = getUi();
  return (
    <>
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
            <p className={`serif ${styles.leadText}`}>{lead ?? project.summary}</p>
            {intro?.map((text, i) => (
              <p key={i} className={styles.intro}>
                {text}
              </p>
            ))}
            {children}
          </div>
          <div className={styles.specs} data-reveal="">
            <h2 className="meta muted">{ui.specSheet}</h2>
            <dl>
              {specs.map((row) => (
                <div key={row.label} className={styles.spec}>
                  <dt className="meta muted">{row.label}</dt>
                  <dd>{"status" in row ? <StatusTag status={project.status} /> : <DraftText value={row.value} />}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}

/** Grande carte « Projet suivant ». */
export function NextProject({ next, total }: { next: Project; total: number }) {
  const ui = getUi();
  return (
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
  );
}
