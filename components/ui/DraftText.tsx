import type { ReactNode } from "react";
import type { Draft } from "@/lib/content";
import { getUi } from "@/lib/content";
import styles from "./DraftText.module.css";

/**
 * Affiche un contenu « à confirmer » (draft) ou incomplet ([À COMPLÉTER…]) en pointillés gris,
 * comme dans la maquette. Le statut est aussi annoncé aux lecteurs d’écran.
 */
export function DraftText({ value, children, className }: { value: Draft; children?: ReactNode; className?: string }) {
  if (!value.draft && !value.missing) return <>{children ?? value.value}</>;
  return (
    <span className={[styles.draft, className].filter(Boolean).join(" ")} data-draft={value.missing ? "missing" : "draft"}>
      {children ?? value.value}
      {value.draft && !value.missing && <span className="sr-only"> ({getUi().draftNote})</span>}
    </span>
  );
}

/** Variante pour les chaînes simples pouvant contenir un repère [À COMPLÉTER…]. */
export function toDraft(value: string, draft = false): Draft {
  return { value, draft, missing: /\[À COMPLÉTER/.test(value) };
}
