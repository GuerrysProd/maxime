import Image from "next/image";
import { Suspense } from "react";
import { CtaCompact } from "@/components/home/CtaCompact";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAIN_ID } from "@/components/layout/SkipLink";
import { DraftText } from "@/components/ui/DraftText";
import { StatusTag } from "@/components/ui/StatusTag";
import { getPages, getProjects, getUi, projectHref } from "@/lib/content";
import { fill } from "@/lib/typo";
import {
  ProjectsExplorer,
  ProjectsExplorerFromUrl,
  type ExplorerItem,
  type ExplorerPreparation,
} from "./ProjectsExplorer";
import explorer from "./ProjectsExplorer.module.css";
import styles from "./ProjectsPage.module.css";

/** Page Projets (aperçus 05 et 05b) : filtres, vues Grille et Index, projets en préparation. */
export function ProjectsPage() {
  const { projects: page } = getPages();
  const ui = getUi();
  const { items, inPreparation, categories } = getProjects();
  const categoryLabel = Object.fromEntries(categories.map((category) => [category.id, category.label]));

  const explorerItems: ExplorerItem[] = items.map((project) => ({
    slug: project.slug,
    categories: project.categories,
    href: projectHref(project.slug),
    preview: { src: project.hero.src, position: project.hero.position },
    card: (
      <ProjectCard
        project={project}
        sizes="(max-width: 900px) 100vw, 50vw"
        parallax
        headingLevel={2}
        reveal={false}
      />
    ),
    row: (
      <>
        <span className={`meta muted ${explorer.cellNumber}`}>{project.number}</span>
        <span className={explorer.cellName}>{project.name}</span>
        <span className={`meta muted ${explorer.optional}`}>
          {project.categories.map((id) => categoryLabel[id]).join(" · ")}
        </span>
        <span className={`meta muted ${explorer.optional}`}>{project.place}</span>
        <span className={explorer.cellStatus}>
          <StatusTag status={project.status} />
        </span>
      </>
    ),
  }));

  const preparation: ExplorerPreparation[] = inPreparation.map((item) => ({
    slug: item.slug,
    preview: item.cover ? { src: item.cover.src, position: item.cover.position } : undefined,
    card: (
      <div className={explorer.prepCard}>
        <div className={explorer.prepMedia}>
          {item.cover && (
            <Image
              src={item.cover.src}
              alt={item.cover.alt}
              fill
              sizes="(max-width: 900px) 96px, 33vw"
              placeholder={item.cover.blurDataURL ? "blur" : "empty"}
              blurDataURL={item.cover.blurDataURL}
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
        <div className={explorer.prepHead}>
          <h3 className={`serif ${explorer.prepName}`}>{item.name}</h3>
          <span className={explorer.prepTag}>{ui.inPreparation}</span>
        </div>
      </div>
    ),
    row: (
      <>
        <span className={`meta muted ${explorer.cellNumber}`}>—</span>
        <span className={explorer.cellName}>{item.name}</span>
        <span className={`meta muted ${explorer.optional}`}>—</span>
        <span className={`meta muted ${explorer.optional}`}>
          <DraftText value={item.place} />
        </span>
        <span className={explorer.cellStatus}>
          <span className={explorer.prepTag}>{ui.inPreparation}</span>
        </span>
      </>
    ),
  }));

  const filters = [
    { id: "all", label: ui.filters.all, count: items.length + inPreparation.length },
    ...categories.map((category) => ({
      id: category.id,
      label: category.label,
      count: items.filter((project) => project.categories.includes(category.id)).length,
    })),
  ];

  const explorerProps = {
    items: explorerItems,
    preparation,
    filters,
    labels: {
      group: ui.filters.group,
      views: ui.filters.views,
      grid: ui.filters.grid,
      list: ui.filters.list,
      columns: ui.filters.columns,
      countOne: ui.projectsCount.one,
      countOther: ui.projectsCount.other,
      preparationTitle: ui.inPreparation,
    },
  };

  return (
    <>
      <SiteHeader variant="solid" current="projets" />
      <main id={MAIN_ID} className={styles.main}>
        <header className={`wrap g12 ${styles.header}`}>
          <div className={styles.titleBlock}>
            <p className="meta muted">{page.eyebrow}</p>
            <h1 className={`serif ${styles.title}`}>{page.title}</h1>
          </div>
          <p className={`muted ${styles.intro}`}>
            {page.intro}{" "}
            {fill(page.counts, { projects: items.length, preparation: inPreparation.length })}
          </p>
        </header>
        <Suspense fallback={<ProjectsExplorer {...explorerProps} />}>
          <ProjectsExplorerFromUrl {...explorerProps} />
        </Suspense>
        <CtaCompact />
      </main>
    </>
  );
}
