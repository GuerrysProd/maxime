"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./ChapterNav.module.css";

/** Sommaire collant des chapitres (brief §5) : le chapitre à l’écran est souligné en terre cuite. */
export function ChapterNav({
  chapters,
  title,
  label,
  children,
}: {
  chapters: { id: string; number: string; label: string }[];
  title: string;
  label: string;
  children?: ReactNode;
}) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => Boolean(section));
    let frame = 0;
    // Chapitre actif : le dernier dont le haut a passé 40 % de la hauteur d’écran (le premier par défaut).
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [chapters]);

  return (
    <aside className={styles.aside}>
      <nav className={styles.nav} aria-label={label}>
        <p className="meta muted">{title}</p>
        <ol>
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={styles.link}
                aria-current={chapter.id === active ? "location" : undefined}
              >
                <span className={styles.number}>{chapter.number}</span>
                <span className={styles.label}>{chapter.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </aside>
  );
}
