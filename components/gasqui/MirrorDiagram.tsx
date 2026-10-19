import styles from "./MirrorDiagram.module.css";

/* Schéma de principe (viewBox 800 × 360) : point d’observation → 3 miroirs → œuvre. */
const OBSERVER = { x: 90, y: 300 };
const MIRRORS = [
  { x: 250, y: 80 },
  { x: 470, y: 290 },
  { x: 640, y: 80 },
];
const ARTWORK = { x: 735, y: 290 };
const PATH = [OBSERVER, ...MIRRORS, ARTWORK];
const MIRROR_HALF = 38;

const unit = (x: number, y: number) => {
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
};

/** Miroir perpendiculaire à la bissectrice des rayons entrant et sortant (loi de la réflexion). */
const mirrorLines = MIRRORS.map((m, i) => {
  const before = PATH[i];
  const after = PATH[i + 2];
  const a = unit(before.x - m.x, before.y - m.y);
  const b = unit(after.x - m.x, after.y - m.y);
  const normal = unit(a.x + b.x, a.y + b.y);
  const along = { x: -normal.y, y: normal.x };
  return {
    x1: m.x - along.x * MIRROR_HALF,
    y1: m.y - along.y * MIRROR_HALF,
    x2: m.x + along.x * MIRROR_HALF,
    y2: m.y + along.y * MIRROR_HALF,
    label: { x: m.x - normal.x * 26, y: m.y - normal.y * 26 + 5 },
  };
});

/** Le jardin par ricochet : tracé du regard animé en boucle lente (2,4 s), figé en mouvement réduit. */
export function MirrorDiagram({ label, observer, artwork }: { label: string; observer: string; artwork: string }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        <svg viewBox="0 0 800 360" role="img" aria-label={label}>
          <polyline points={PATH.map((p) => `${p.x},${p.y}`).join(" ")} className={styles.track} />
          <polyline points={PATH.map((p) => `${p.x},${p.y}`).join(" ")} className={styles.ray} pathLength={1} />
          {mirrorLines.map((line, i) => (
            <g key={i}>
              <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} className={styles.mirror} />
              <text x={line.label.x} y={line.label.y} className={styles.number}>
                {i + 1}
              </text>
            </g>
          ))}
          <circle cx={OBSERVER.x} cy={OBSERVER.y} r={10} className={styles.observer} />
          <rect x={ARTWORK.x - 11} y={ARTWORK.y - 11} width={22} height={22} className={styles.artwork} />
        </svg>
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.key}>
          <span className={styles.dot} aria-hidden="true" />
          {observer}
        </span>
        <span className={styles.key}>
          <span className={styles.square} aria-hidden="true" />
          {artwork}
        </span>
        <span className="meta muted">{label}</span>
      </figcaption>
    </figure>
  );
}
