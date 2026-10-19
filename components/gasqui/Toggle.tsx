"use client";

import styles from "./Toggle.module.css";

/** Bascule à deux états en pilule (jour / nuit, été / hiver) : boutons aria-pressed. */
export function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = "light",
}: {
  label: string;
  options: { id: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  tone?: "light" | "dark";
}) {
  return (
    <div className={styles.toggle} role="group" aria-label={label} data-tone={tone}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-pressed={option.id === value} onClick={() => onChange(option.id)}>
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
