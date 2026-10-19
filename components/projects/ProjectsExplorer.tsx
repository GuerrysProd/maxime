"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./ProjectsExplorer.module.css";

export interface ExplorerItem {
  slug: string;
  categories: string[];
  href: string;
  preview: { src: string; position?: string };
  /** Carte (vue Grille) et contenu de ligne (vue Index), rendus côté serveur. */
  card: ReactNode;
  row: ReactNode;
}

export interface ExplorerPreparation {
  slug: string;
  preview?: { src: string; position?: string };
  card: ReactNode;
  row: ReactNode;
}

export interface ExplorerLabels {
  group: string;
  views: string;
  grid: string;
  list: string;
  columns: { number: string; project: string; category: string; place: string; status: string };
  countOne: string;
  countOther: string;
  preparationTitle: string;
}

type View = "grid" | "list";
const ALL = "all";

/** Motif éditorial de 7 cartes qui se répète (brief §6). */
const PATTERN: { column: string; ratio: string; title: string; className?: string }[] = [
  { column: "1 / span 5", ratio: "4 / 5", title: "30px" },
  { column: "7 / span 6", ratio: "3 / 2", title: "30px", className: "offset" },
  { column: "1 / span 7", ratio: "3 / 2", title: "30px", className: "bottom" },
  { column: "9 / span 4", ratio: "4 / 5", title: "30px" },
  { column: "span 4", ratio: "4 / 3", title: "24px" },
  { column: "span 4", ratio: "4 / 3", title: "24px" },
  { column: "span 4", ratio: "4 / 3", title: "24px" },
];

const LEAVE_MS = 200;

/** Lit les filtres de l’URL (?categorie=…&vue=index) puis affiche l’explorateur. */
export function ProjectsExplorerFromUrl(props: Omit<Parameters<typeof ProjectsExplorer>[0], "initialCategory" | "initialView">) {
  const params = useSearchParams();
  const category = params.get("categorie");
  const known = props.filters.some((filter) => filter.id === category);
  return (
    <ProjectsExplorer
      {...props}
      initialCategory={known && category ? category : ALL}
      initialView={params.get("vue") === "index" ? "list" : "grid"}
    />
  );
}

/**
 * Projets : filtres par catégorie (avec compteurs, aria-pressed), vues Grille et Index,
 * synchronisés avec l’URL. Les cartes sortantes s’effacent (200 ms), les nouvelles
 * apparaissent en cascade. Vue Index : l’aperçu suit le curseur, masqué au clavier.
 */
export function ProjectsExplorer({
  items,
  preparation,
  filters,
  labels,
  initialCategory = ALL,
  initialView = "grid",
}: {
  items: ExplorerItem[];
  preparation: ExplorerPreparation[];
  filters: { id: string; label: string; count: number }[];
  labels: ExplorerLabels;
  initialCategory?: string;
  initialView?: View;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [shown, setShown] = useState(initialCategory);
  const [leaving, setLeaving] = useState(false);
  const [view, setView] = useState<View>(initialView);
  const timer = useRef<number | undefined>(undefined);

  // URL ← état (sans recharger ni défiler).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (category === ALL) url.searchParams.delete("categorie");
    else url.searchParams.set("categorie", category);
    if (view === "list") url.searchParams.set("vue", "index");
    else url.searchParams.delete("vue");
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [category, view]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = (id: string) => {
    if (id === category) return;
    setCategory(id);
    window.clearTimeout(timer.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(id);
      return;
    }
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      setShown(id);
      setLeaving(false);
    }, LEAVE_MS);
  };

  const visible = shown === ALL ? items : items.filter((item) => item.categories.includes(shown));
  const withPreparation = shown === ALL;
  const total = visible.length + (withPreparation ? preparation.length : 0);
  const countLabel = (total > 1 ? labels.countOther : labels.countOne).replace("{n}", String(total));

  return (
    <>
      <div className={styles.toolbar}>
        <div className="wrap">
        <div className={styles.toolbarInner}>
          <div role="group" aria-label={labels.group} className={styles.filters}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={styles.chip}
                aria-pressed={filter.id === category}
                onClick={() => pick(filter.id)}
              >
                {filter.label}
                <span className={styles.chipCount}>{String(filter.count).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <div className={styles.toolbarEnd}>
            <p className="meta muted" aria-live="polite">
              {countLabel}
            </p>
            <div role="group" aria-label={labels.views} className={styles.segment}>
              <button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                <Icon name="grid" size={14} />
                {labels.grid}
              </button>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
                <Icon name="list" size={14} />
                {labels.list}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className={`wrap ${styles.results}`} data-leaving={leaving || undefined}>
        {view === "grid" ? (
          <>
            <ul className={styles.grid} key={`grid-${shown}`}>
              {visible.map((item, index) => {
                const slot = PATTERN[index % PATTERN.length];
                return (
                  <li
                    key={item.slug}
                    className={[styles.slot, slot.className && styles[slot.className]].filter(Boolean).join(" ")}
                    style={
                      {
                        gridColumn: slot.column,
                        "--card-ratio": slot.ratio,
                        "--card-title": slot.title,
                        "--enter-delay": `${(index % 4) * 70}ms`,
                      } as CSSProperties
                    }
                  >
                    {item.card}
                  </li>
                );
              })}
            </ul>
            {withPreparation && preparation.length > 0 && (
              <section className={styles.preparation} aria-labelledby="preparation-titre">
                <div className={styles.preparationHead}>
                  <h2 id="preparation-titre" className="meta muted">
                    {labels.preparationTitle}
                  </h2>
                  <p className="meta muted">{String(preparation.length).padStart(2, "0")}</p>
                </div>
                <ul className={styles.preparationList}>
                  {preparation.map((item) => (
                    <li key={item.slug}>{item.card}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <IndexView key={`list-${shown}`} items={visible} preparation={withPreparation ? preparation : []} labels={labels} />
        )}
      </div>
    </>
  );
}

function IndexView({
  items,
  preparation,
  labels,
}: {
  items: ExplorerItem[];
  preparation: ExplorerPreparation[];
  labels: ExplorerLabels;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [point, setPoint] = useState({ x: 600, y: 0 });
  const rows = [...items, ...preparation];
  const current = hover !== null ? rows[hover] : undefined;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    setKeyboard(false);
    setPoint({ x: Math.round(Math.min(x + 32, box.width - 290)), y: Math.round(Math.max(0, y - 95)) });
  };

  return (
    <div className={styles.index} onPointerMove={onPointerMove} onPointerLeave={() => setHover(null)}>
      <div className={styles.preview} aria-hidden="true" data-visible={(current?.preview && !keyboard) || undefined} style={{ left: point.x, top: point.y }}>
        {rows.map((row, index) =>
          row.preview ? (
            <Image
              key={row.slug}
              src={row.preview.src}
              alt=""
              width={280}
              height={190}
              sizes="280px"
              className={styles.previewImage}
              data-on={index === hover || undefined}
              style={{ objectPosition: row.preview.position }}
            />
          ) : null,
        )}
      </div>
      <div className={`${styles.row} ${styles.rowHead}`} aria-hidden="true">
        <span className="meta muted">{labels.columns.number}</span>
        <span className="meta muted">{labels.columns.project}</span>
        <span className={`meta muted ${styles.optional}`}>{labels.columns.category}</span>
        <span className={`meta muted ${styles.optional}`}>{labels.columns.place}</span>
        <span className="meta muted">{labels.columns.status}</span>
        <span />
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={item.slug} style={{ "--enter-delay": `${index * 50}ms` } as CSSProperties} className={styles.rowItem}>
            <Link
              href={item.href}
              className={styles.row}
              data-on={hover === index || undefined}
              onPointerEnter={(event) => event.pointerType === "mouse" && setHover(index)}
              onFocus={() => {
                setHover(index);
                setKeyboard(true);
              }}
            >
              {item.row}
              <Icon name="arrow-up-right" size={20} />
            </Link>
          </li>
        ))}
        {preparation.map((item, i) => (
          <li
            key={item.slug}
            style={{ "--enter-delay": `${(items.length + i) * 50}ms` } as CSSProperties}
            className={styles.rowItem}
            onPointerEnter={(event) => event.pointerType === "mouse" && setHover(items.length + i)}
          >
            <div className={styles.row} data-muted="" data-on={hover === items.length + i || undefined}>
              {item.row}
              <span />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
