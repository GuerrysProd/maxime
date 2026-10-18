import Image from "next/image";
import type { CSSProperties } from "react";
import { ProjectCard, type CardSize } from "@/components/cards/ProjectCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { DraftText } from "@/components/ui/DraftText";
import type { Home, Project, ProjectInPreparation } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import styles from "./SelectedProjects.module.css";

/**
 * Motif éditorial de 7 cartes (brief §6, vue Grille) : 1/span 5 (4:5), 7/span 6 (3:2, décalée),
 * 1/span 7 (3:2, alignée en bas), 9/span 4 (4:5), puis trois span 4 (4:3).
 */
const PATTERN: { column: string; ratio: string; size: CardSize; sizes: string; className?: string }[] = [
  { column: "1 / span 5", ratio: "4 / 5", size: "lg", sizes: "(max-width: 900px) 100vw, 40vw" },
  { column: "7 / span 6", ratio: "3 / 2", size: "lg", sizes: "(max-width: 900px) 100vw, 50vw", className: "offset" },
  { column: "1 / span 7", ratio: "3 / 2", size: "lg", sizes: "(max-width: 900px) 100vw, 58vw", className: "bottom" },
  { column: "9 / span 4", ratio: "4 / 5", size: "md", sizes: "(max-width: 900px) 100vw, 33vw" },
  { column: "1 / span 4", ratio: "4 / 3", size: "sm", sizes: "(max-width: 900px) 100vw, 33vw" },
  { column: "5 / span 4", ratio: "4 / 3", size: "sm", sizes: "(max-width: 900px) 100vw, 33vw" },
  { column: "9 / span 4", ratio: "4 / 3", size: "sm", sizes: "(max-width: 900px) 100vw, 33vw" },
];

/** Mobile (écran 02) : les 4 premiers en colonne, les suivants dans une rangée défilante. */
const MOBILE_RATIOS = ["4 / 5", "3 / 2", "3 / 2", "4 / 3"];
const MOBILE_FEATURED = MOBILE_RATIOS.length;

export function SelectedProjects({
  home,
  projects,
  inPreparation,
}: {
  home: Home["projects"];
  projects: Project[];
  inPreparation: ProjectInPreparation[];
}) {
  const count = String(projects.length).padStart(2, "0");
  return (
    <section className={styles.section} aria-labelledby="projets-titre">
      <div className="wrap">
        <SectionHeader
          id="projets-titre"
          number={home.number}
          label={home.label}
          title={home.title}
          aside={
            <>
              <p className="muted">{home.intro}</p>
              <ArrowLink href={home.allLink.href}>
                {home.allLink.label} ({count})
              </ArrowLink>
            </>
          }
        />

        <div className={`g12 ${styles.grid}`}>
          {projects.map((project, index) => {
            const slot = PATTERN[index % PATTERN.length];
            return (
              <ProjectCard
                key={project.slug}
                project={project}
                size={slot.size}
                ratio={slot.ratio}
                sizes={slot.sizes}
                parallax
                className={slot.className ? styles[slot.className] : undefined}
                style={{ gridColumn: slot.column } as CSSProperties}
                revealDelay={(index % 3) * 80}
              />
            );
          })}
        </div>

        <div className={styles.mobileList}>
          {projects.slice(0, MOBILE_FEATURED).map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              ratio={MOBILE_RATIOS[index]}
              sizes="100vw"
              reveal={false}
            />
          ))}
        </div>
      </div>

      {projects.length > MOBILE_FEATURED && (
        <div className={styles.others}>
          <div className={`wrap ${styles.othersHead}`}>
            <h3 className="meta muted">{home.others}</h3>
            <p className="meta muted" aria-hidden="true">
              {home.scrollHint}
            </p>
          </div>
          <ul className={styles.rail}>
            {projects.slice(MOBILE_FEATURED).map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} size="xs" sizes="260px" headingLevel={4} reveal={false} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="wrap">
        <div className={`g12 ${styles.preparation}`} data-reveal="">
          <h3 className={`meta muted ${styles.preparationTitle}`}>{home.inPreparation}</h3>
          <ul className={styles.preparationList}>
            {inPreparation.map((item) => (
              <li key={item.slug} className={styles.preparationItem}>
                <div className={styles.thumb}>
                  {item.cover && (
                    <Image
                      src={item.cover.src}
                      alt={item.cover.alt}
                      fill
                      sizes="96px"
                      placeholder={item.cover.blurDataURL ? "blur" : "empty"}
                      blurDataURL={item.cover.blurDataURL}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div>
                  <p className={`serif ${styles.preparationName}`}>{item.name}</p>
                  <p className={`meta muted ${styles.preparationPlace}`}>
                    <DraftText value={item.place} />
                    {item.note && (
                      <>
                        {" · "}
                        <DraftText value={item.note} />
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
