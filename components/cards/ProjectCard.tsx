import Link from "next/link";
import type { CSSProperties } from "react";
import { projectHref, type Project } from "@/lib/content";
import { Picture } from "@/components/media/Picture";
import { Icon } from "@/components/ui/Icon";
import { MetaLine } from "@/components/ui/MetaLine";
import { StatusTag } from "@/components/ui/StatusTag";
import styles from "./ProjectCard.module.css";

export type CardSize = "lg" | "md" | "sm" | "xs";

/** Carte projet « 01 / Nom » (brief §5) : survol = zoom ×1,035 en 1,4 s, flèche ↗ décalée. */
export function ProjectCard({
  project,
  size = "md",
  ratio,
  sizes,
  parallax,
  headingLevel = 3,
  className,
  style,
  reveal = true,
  revealDelay,
}: {
  project: Project;
  size?: CardSize;
  /** Sans ratio, le cadre suit la variable CSS --card-ratio posée par le conteneur. */
  ratio?: string;
  sizes: string;
  parallax?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
  reveal?: boolean;
  revealDelay?: number;
}) {
  const Heading = (`h${headingLevel}` as "h2" | "h3" | "h4");
  return (
    <Link
      href={projectHref(project.slug)}
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-size={size}
      data-reveal={reveal ? "" : undefined}
      style={{ ...style, ...(revealDelay ? ({ "--reveal-delay": `${revealDelay}ms` } as CSSProperties) : {}) }}
    >
      <div className={styles.media} style={ratio ? { aspectRatio: ratio } : undefined}>
        <Picture image={project.cover} sizes={sizes} parallax={parallax ? 0.04 : undefined} imageClassName={styles.image} />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <Heading className={`serif ${styles.title}`}>
            <span className={styles.number}>{project.number} /</span>
            {project.name}
          </Heading>
          {size !== "xs" && <Icon name="arrow-up-right" size={18} className={styles.arrow} />}
        </div>
        <p className={styles.summary}>{project.summary}</p>
        <div className={styles.meta}>
          <MetaLine items={project.meta} className={`muted ${styles.metaFull}`} />
          <MetaLine items={project.metaShort} className={`muted ${styles.metaShort}`} />
          <StatusTag status={project.status} />
        </div>
      </div>
    </Link>
  );
}
