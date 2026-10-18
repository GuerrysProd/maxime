import { Fragment } from "react";
import type { Draft } from "@/lib/content";
import { DraftText, toDraft } from "./DraftText";

/** Ligne de métadonnées « RÉSIDENTIEL — COURCHEVEL 1850 — RÉNOVATION » (brief §5). */
export function MetaLine({
  items,
  separator = " — ",
  className,
}: {
  items: (Draft | string)[];
  separator?: string;
  className?: string;
}) {
  return (
    <p className={["meta", className].filter(Boolean).join(" ")}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && separator}
          <DraftText value={typeof item === "string" ? toDraft(item) : item} />
        </Fragment>
      ))}
    </p>
  );
}
