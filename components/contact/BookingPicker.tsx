"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./BookingPicker.module.css";

const TZ = "Europe/Paris";

export interface BookingLabels {
  label: string;
  title: string;
  text: string;
  weekOf: string;
  dayGroup: string;
  slotGroup: string;
  book: string;
  slotFormat: string;
  demoNote: string;
  previousWeek: string;
  nextWeek: string;
  empty: string;
}

interface Slot {
  start: string;
}

const isoDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

/** Lundi de la semaine utile (la suivante si l’on est le week-end). */
function weekStart(base: Date): Date {
  const day = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()));
  const weekday = day.getUTCDay();
  const delta = weekday === 0 ? 1 : weekday === 6 ? 2 : 1 - weekday;
  day.setUTCDate(day.getUTCDate() + delta);
  return day;
}

/**
 * Prise de rendez-vous (aperçu 09) : jours et créneaux de la semaine, fournis par
 * /api/booking/slots (exemples, ou Cal.com quand il est branché). La réservation s’ouvre
 * sur la page de l’outil (bookingUrl), sinon le bouton reste inactif avec une note.
 */
export function BookingPicker({
  labels,
  bookingUrl,
  intro,
}: {
  labels: BookingLabels;
  bookingUrl?: string;
  intro: React.ReactNode;
}) {
  const [week, setWeek] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [provider, setProvider] = useState<"demo" | "calcom">("demo");
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  // Date du jour connue seulement dans le navigateur (page prérendue).
  useEffect(() => {
    const frame = requestAnimationFrame(() => setWeek(weekStart(new Date())));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!week) return;
    const controller = new AbortController();
    fetch(`/api/booking/slots?start=${week.toISOString().slice(0, 10)}&days=5`, { signal: controller.signal })
      .then((response) => response.json())
      .then((body: { provider: "demo" | "calcom"; slots: Slot[] }) => {
        setProvider(body.provider);
        setSlots(body.slots);
        const first = body.slots[0];
        setDay(first ? isoDay(new Date(first.start)) : null);
        setSlot(first?.start ?? null);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [week]);

  const days = useMemo(() => {
    if (!week) return [];
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(week.getTime() + i * 86_400_000 + 12 * 3_600_000);
      const key = isoDay(date);
      return {
        key,
        short: new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short" }).format(date).replace(".", ""),
        number: new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric" }).format(date),
        long: new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(date),
        slots: slots.filter((s) => isoDay(new Date(s.start)) === key),
      };
    });
  }, [week, slots]);

  const time = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const current = days.find((d) => d.key === day);
  const month = week ? new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, month: "long", year: "numeric" }).format(week) : "";
  const slotLabel =
    current && slot
      ? labels.slotFormat
          .replace("{day}", new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "short", day: "numeric" }).format(new Date(slot)))
          .replace("{time}", time(slot))
      : "";
  const bookHref = bookingUrl && slot ? `${bookingUrl}${bookingUrl.includes("?") ? "&" : "?"}date=${day}&slot=${encodeURIComponent(slot)}` : undefined;

  const shift = (weeks: number) => {
    if (!week) return;
    setSlots([]);
    setWeek(new Date(week.getTime() + weeks * 7 * 86_400_000));
  };
  const canGoBack = week ? week.getTime() > weekStart(new Date()).getTime() : false;

  return (
    <section id="rendez-vous" className={styles.box} aria-labelledby="rdv-titre">
      <p className="meta muted">{labels.label}</p>
      <h2 id="rdv-titre" className={`serif ${styles.title}`}>
        {labels.title}
      </h2>
      <p className={styles.text}>{intro}</p>

      <div className={styles.weekRow}>
        <p className={`meta ${styles.month}`}>{month}</p>
        <p className={`${styles.help} ${styles.weekOf}`}>
          {week ? labels.weekOf.replace("{day}", new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, day: "numeric" }).format(week)) : ""}
        </p>
        <div className={styles.weekNav}>
          <button type="button" className={styles.navButton} onClick={() => shift(-1)} disabled={!canGoBack}>
            <Icon name="arrow-left" size={14} />
            <span className="sr-only">{labels.previousWeek}</span>
          </button>
          <button type="button" className={styles.navButton} onClick={() => shift(1)} disabled={!week}>
            <Icon name="arrow-right" size={14} />
            <span className="sr-only">{labels.nextWeek}</span>
          </button>
        </div>
      </div>

      <div role="radiogroup" aria-label={labels.dayGroup} className={styles.days}>
        {(days.length ? days : Array.from({ length: 5 }, (_, i) => ({ key: String(i), short: "", number: "", long: "", slots: [] }))).map((d) => (
          <button
            key={d.key}
            type="button"
            role="radio"
            aria-checked={d.key === day}
            aria-label={d.long || undefined}
            className={styles.day}
            disabled={!d.slots.length}
            onClick={() => {
              setDay(d.key);
              setSlot(d.slots[0]?.start ?? null);
            }}
          >
            <span className={styles.dayName}>{d.short}</span>
            <span className={styles.dayNumber}>{d.number}</span>
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label={labels.slotGroup} className={styles.slots}>
        {current?.slots.length ? (
          current.slots.map((s) => (
            <button
              key={s.start}
              type="button"
              role="radio"
              aria-checked={s.start === slot}
              className={styles.slot}
              onClick={() => setSlot(s.start)}
            >
              {time(s.start)}
            </button>
          ))
        ) : (
          <p className={styles.help}>{week ? labels.empty : " "}</p>
        )}
      </div>

      {bookHref ? (
        <a className={styles.book} href={bookHref} target="_blank" rel="noopener">
          {labels.book.replace("{slot}", slotLabel)}
        </a>
      ) : (
        <button type="button" className={styles.book} aria-disabled="true" aria-describedby="rdv-note">
          {labels.book.replace("{slot}", slotLabel)}
        </button>
      )}
      {(provider === "demo" || !bookingUrl) && (
        <p id="rdv-note" className={styles.help}>
          {labels.demoNote}
        </p>
      )}
    </section>
  );
}
