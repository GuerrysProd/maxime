/** Icônes de la maquette (traits 1,3–1,4 px, couleur du texte). Toujours décoratives. */
type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up-right"
  | "arrow-down"
  | "arrows-h"
  | "menu"
  | "close"
  | "phone"
  | "plus"
  | "grid"
  | "list"
  | "download"
  | "check";

const paths: Record<IconName, { viewBox: string; d: string; width?: number }> = {
  "arrow-right": { viewBox: "0 0 16 16", d: "M2 8h11.5M9 3.5L13.5 8 9 12.5", width: 1.4 },
  "arrow-left": { viewBox: "0 0 16 16", d: "M14 8H2.5M7 3.5L2.5 8 7 12.5", width: 1.4 },
  "arrow-up-right": { viewBox: "0 0 18 18", d: "M5 13L13 5M6.5 5H13v6.5", width: 1.4 },
  "arrows-h": { viewBox: "0 0 20 20", d: "M7 5L2 10l5 5M13 5l5 5-5 5", width: 1.4 },
  grid: { viewBox: "0 0 16 16", d: "M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z", width: 1.2 },
  list: { viewBox: "0 0 16 16", d: "M2 4h12M2 8h12M2 12h12", width: 1.2 },
  download: { viewBox: "0 0 16 16", d: "M8 2v9M4 7l4 4 4-4M2 14h12", width: 1.4 },
  "arrow-down": { viewBox: "0 0 14 14", d: "M7 1.5v11M2.5 8L7 12.5 11.5 8", width: 1.3 },
  menu: { viewBox: "0 0 20 20", d: "M2 7h16M2 13h16", width: 1.4 },
  close: { viewBox: "0 0 18 18", d: "M3 3l12 12M15 3L3 15", width: 1.4 },
  phone: {
    viewBox: "0 0 18 18",
    d: "M4.5 2.5h2.6l1.3 3.2-1.7 1.1a8.5 8.5 0 0 0 4.5 4.5l1.1-1.7 3.2 1.3v2.6a1.5 1.5 0 0 1-1.6 1.5A12.5 12.5 0 0 1 3 4.1 1.5 1.5 0 0 1 4.5 2.5z",
    width: 1.3,
  },
  plus: { viewBox: "0 0 14 14", d: "M7 1v12M1 7h12", width: 1.3 },
  check: { viewBox: "0 0 22 22", d: "M4 11.5l4.5 4.5L18 6.5", width: 1.6 },
};

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const { viewBox, d, width } = paths[name];
  return (
    <svg className={className} width={size} height={size} viewBox={viewBox} fill="none" aria-hidden="true" focusable="false">
      <path d={d} stroke="currentColor" strokeWidth={width} />
    </svg>
  );
}
