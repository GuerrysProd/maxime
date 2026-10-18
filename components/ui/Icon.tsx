/** Icônes de la maquette (traits 1,3–1,4 px, couleur du texte). Toujours décoratives. */
type IconName = "arrow-right" | "arrow-up-right" | "arrow-down" | "menu" | "close" | "phone" | "plus";

const paths: Record<IconName, { viewBox: string; d: string; width?: number }> = {
  "arrow-right": { viewBox: "0 0 16 16", d: "M2 8h11.5M9 3.5L13.5 8 9 12.5", width: 1.4 },
  "arrow-up-right": { viewBox: "0 0 18 18", d: "M5 13L13 5M6.5 5H13v6.5", width: 1.4 },
  "arrow-down": { viewBox: "0 0 14 14", d: "M7 1.5v11M2.5 8L7 12.5 11.5 8", width: 1.3 },
  menu: { viewBox: "0 0 20 20", d: "M2 7h16M2 13h16", width: 1.4 },
  close: { viewBox: "0 0 18 18", d: "M3 3l12 12M15 3L3 15", width: 1.4 },
  phone: {
    viewBox: "0 0 18 18",
    d: "M4.5 2.5h2.6l1.3 3.2-1.7 1.1a8.5 8.5 0 0 0 4.5 4.5l1.1-1.7 3.2 1.3v2.6a1.5 1.5 0 0 1-1.6 1.5A12.5 12.5 0 0 1 3 4.1 1.5 1.5 0 0 1 4.5 2.5z",
    width: 1.3,
  },
  plus: { viewBox: "0 0 14 14", d: "M7 1v12M1 7h12", width: 1.3 },
};

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const { viewBox, d, width } = paths[name];
  return (
    <svg className={className} width={size} height={size} viewBox={viewBox} fill="none" aria-hidden="true" focusable="false">
      <path d={d} stroke="currentColor" strokeWidth={width} />
    </svg>
  );
}
