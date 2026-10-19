"use client";

import { useState } from "react";
import { Picture } from "@/components/media/Picture";
import type { ProjectModules } from "@/lib/content";
import { Toggle } from "./Toggle";
import styles from "./DayNight.module.css";

type Moment = "day" | "night";

/** Jour / nuit (brief §6) : fondu entre les deux rendus réels des guirlandes. */
export function DayNight({ content }: { content: ProjectModules["dayNight"] }) {
  const [moment, setMoment] = useState<Moment>("day");
  const state = content[moment];

  return (
    <div className={styles.grid}>
      <figure className={styles.figure}>
        <div className={styles.frame} data-moment={moment}>
          <div className={styles.day} aria-hidden={moment !== "day"}>
            <Picture image={content.day.image} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div className={styles.night} aria-hidden={moment !== "night"}>
            <Picture image={content.night.image} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <span className={`meta ${styles.badge}`} aria-hidden="true">
            {state.label}
          </span>
        </div>
      </figure>
      <div className={styles.side}>
        <div className={styles.text}>
          {content.text.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <Toggle
          label={content.group}
          value={moment}
          onChange={setMoment}
          options={[
            { id: "day", label: content.day.button },
            { id: "night", label: content.night.button },
          ]}
        />
      </div>
    </div>
  );
}
