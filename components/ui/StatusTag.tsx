import { getUi, statusLabel, type Project } from "@/lib/content";
import styles from "./StatusTag.module.css";

/** Statut de projet ; en pointillés gris tant qu’il n’est pas validé par Maxime (brief §5). */
export function StatusTag({ status, short }: { status: Project["status"]; short?: string }) {
  const label = short ?? statusLabel(status.value);
  return (
    <span className={styles.tag} data-draft={status.draft || undefined}>
      {label}
      {status.draft && <span className="sr-only"> ({getUi().draftNote})</span>}
    </span>
  );
}
