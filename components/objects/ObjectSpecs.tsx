import Link from "next/link";
import { DraftText, toDraft } from "@/components/ui/DraftText";
import { getPages, getProject, projectHref, type ObjectPiece } from "@/lib/content";
import styles from "./ObjectSpecs.module.css";

type SpecKey = "materials" | "dimensions" | "light" | "edition" | "project" | "extra";

/** Fiche technique d’une pièce (matériaux, dimensions, source lumineuse, édition, projet d’origine). */
export function ObjectSpecs({
  piece,
  rows = ["materials", "dimensions", "light", "edition", "project", "extra"],
  linkProject = true,
}: {
  piece: ObjectPiece;
  rows?: SpecKey[];
  linkProject?: boolean;
}) {
  const labels = getPages().object.specs;
  const project = piece.project ? getProject(piece.project) : undefined;

  const items: { label: string; value: React.ReactNode }[] = [];
  for (const row of rows) {
    if (row === "materials") items.push({ label: labels.materials, value: <DraftText value={piece.materials} /> });
    if (row === "dimensions" && piece.dimensions) items.push({ label: labels.dimensions, value: <DraftText value={piece.dimensions} /> });
    if (row === "light" && piece.light) items.push({ label: labels.light, value: <DraftText value={piece.light} /> });
    if (row === "edition" && piece.edition) items.push({ label: labels.edition, value: <DraftText value={piece.edition} /> });
    if (row === "project") {
      items.push({
        label: labels.project,
        value: project ? (
          linkProject ? (
            <Link href={projectHref(project.slug)} className={styles.link}>
              {project.name}, {project.place}
            </Link>
          ) : (
            project.name
          )
        ) : (
          <DraftText value={toDraft(piece.projectMissing ?? "")} />
        ),
      });
    }
    if (row === "extra") {
      for (const extra of piece.extraSpecs ?? []) items.push({ label: extra.label, value: <DraftText value={extra.value} /> });
    }
  }

  return (
    <dl className={styles.specs}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <dt className="meta muted">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
