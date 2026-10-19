import type { CSSProperties } from "react";
import type { Home, Services } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import styles from "./Method.module.css";

/** 05 — Méthode : cinq étapes sur une ligne de temps. */
export function Method({
  home,
  steps,
  receiveLabel,
  id,
}: {
  home: Pick<Home["method"], "label" | "title" | "intro"> & { number?: string };
  steps: Services["method"];
  /** Affiche, pour chaque étape, ce que le client reçoit (page Services). */
  receiveLabel?: string;
  id?: string;
}) {
  return (
    <section className={styles.section} aria-labelledby="methode-titre" id={id}>
      <div className="wrap">
        <SectionHeader
          id="methode-titre"
          number={home.number}
          label={home.label}
          title={home.title}
          aside={<p className="muted">{home.intro}</p>}
          spacing="xl"
        />
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={styles.step}
              data-reveal=""
              style={{ "--reveal-delay": `${index * 80}ms` } as CSSProperties}
            >
              <div className={styles.rail} aria-hidden="true">
                <span className={styles.dot} data-first={index === 0 || undefined} />
                <span className={styles.line} data-last={index === steps.length - 1 || undefined} />
              </div>
              <p className={`serif ${styles.number}`}>{step.number}</p>
              <div className={styles.text}>
                <h3 className={styles.title}>{step.title}</h3>
                <p className="muted">{step.text}</p>
                {receiveLabel && (
                  <p className={styles.receive}>
                    <span className="meta muted">{receiveLabel}</span>
                    {step.deliverable}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
