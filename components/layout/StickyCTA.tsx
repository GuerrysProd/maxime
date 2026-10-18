"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./StickyCTA.module.css";

/** Éléments qui masquent la barre quand ils sont à l’écran (hero, bandeau CTA, pied de page). */
const HIDE_ON = "[data-hero], [data-cta-section], [data-site-footer]";

/**
 * Barre basse mobile « Démarrer un projet » + appel (brief §5) : visible hors hero,
 * masquée quand le bandeau d’appel à l’action ou le pied de page sont à l’écran.
 */
export function StickyCTA({
  cta,
  phone,
  callLabel,
  label,
}: {
  cta: { label: string; href: string };
  phone: { href: string };
  callLabel: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(HIDE_ON));
    if (!targets.length) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setVisible(onScreen.size === 0);
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <aside className={styles.bar} aria-label={label} data-visible={visible || undefined} inert={!visible}>
      <Link className={styles.cta} href={cta.href}>
        {cta.label}
      </Link>
      <a className={styles.call} href={phone.href}>
        <Icon name="phone" size={18} />
        <span className="sr-only">{callLabel}</span>
      </a>
    </aside>
  );
}
