import Link from "next/link";
import { getSite, getUi } from "@/lib/content";
import styles from "./LangSwitch.module.css";

/** FR / EN. L’anglais n’existe pas encore : EN est affiché sans lien (pas de lien mort). */
export function LangSwitch({ current = "fr", className }: { current?: string; className?: string }) {
  const { languages } = getSite();
  const ui = getUi();
  return (
    <div className={[styles.lang, className].filter(Boolean).join(" ")} role="group" aria-label={ui.language}>
      {languages.map((language, index) => (
        <span key={language.code} className={styles.item}>
          {index > 0 && (
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
          )}
          {language.href ? (
            <Link
              href={language.href}
              lang={language.code}
              aria-current={language.code === current ? "true" : undefined}
              className={styles.link}
            >
              {language.label}
            </Link>
          ) : (
            <span lang={language.code} className={styles.soon}>
              {language.label}
              <span className="sr-only" lang="fr">
                {" "}
                ({ui.languageSoon})
              </span>
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
