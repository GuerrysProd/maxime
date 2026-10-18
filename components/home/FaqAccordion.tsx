"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FaqItem } from "@/lib/content";
import styles from "./Faq.module.css";

/** Accordéon (brief §6) : un seul panneau ouvert, aria-expanded / aria-controls, + qui pivote à 45°. */
export function FaqAccordion({ items, initiallyOpen = 0 }: { items: FaqItem[]; initiallyOpen?: number }) {
  const [open, setOpen] = useState<number>(initiallyOpen);
  const baseId = useId();

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${baseId}-reponse-${index}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className={`serif ${styles.question}`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span>{item.q}</span>
                <span className={styles.icon} data-open={expanded || undefined} aria-hidden="true">
                  <Icon name="plus" size={14} />
                </span>
              </button>
            </h3>
            <div id={panelId} className={styles.answer} hidden={!expanded}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
