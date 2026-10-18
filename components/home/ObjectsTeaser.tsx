import { ObjectCard } from "@/components/cards/ObjectCard";
import { ArrowLink } from "@/components/ui/ArrowLink";
import type { Home, ObjectPiece, Project } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import styles from "./ObjectsTeaser.module.css";

/** 03 — Objets : fond cacao, la pièce phare en grand puis la collection en vignettes. */
export function ObjectsTeaser({
  home,
  pieces,
  projects,
}: {
  home: Home["objects"];
  pieces: ObjectPiece[];
  projects: Project[];
}) {
  const projectOf = (piece: ObjectPiece) => projects.find((p) => p.slug === piece.project);
  const [feature, ...others] = pieces;
  const featureProject = projectOf(feature);
  const featureMeta = [feature.category, featureProject?.name, feature.tagline].filter(Boolean).join(" — ");

  return (
    <section className={`${styles.section} on-dark`} aria-labelledby="objets-titre" data-reveal="tone">
      <div className="wrap">
        <SectionHeader
          id="objets-titre"
          number={home.number}
          label={home.label}
          title={home.title}
          lead={<p className={styles.intro}>{home.intro}</p>}
          aside={<ArrowLink href={home.link.href}>{home.link.label}</ArrowLink>}
          asideAlign="end"
        />

        <div className={`g12 ${styles.grid}`}>
          <div className={styles.feature}>
            <ObjectCard
              piece={feature}
              variant="feature"
              meta={featureMeta}
              sizes="(max-width: 900px) 100vw, 40vw"
              noImageLabel={home.noImage}
            />
          </div>
          <ul className={styles.tiles}>
            {others.map((piece, index) => {
              const project = projectOf(piece);
              const meta = `${piece.number} — ${piece.category}`;
              return (
                <li key={piece.slug}>
                  <ObjectCard
                    piece={piece}
                    meta={meta}
                    metaExtra={project ? ` · ${project.shortName}` : undefined}
                    sizes="(max-width: 900px) 50vw, 18vw"
                    noImageLabel={home.noImage}
                    revealDelay={(index % 3) * 60}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
