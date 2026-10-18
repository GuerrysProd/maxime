import Image from "next/image";

const LOGOS = {
  monogram: { width: 1070, height: 246 },
  wordmark: { width: 1588, height: 186 },
} as const;

export type BrandTone = "beige" | "cacao";

/** Monogramme ou logotype (PNG de design/assets/logos). Décoratifs par défaut : le lien parent porte le nom. */
export function Logo({
  kind,
  tone,
  height,
  width,
  alt = "",
  className,
  sizes,
  preload,
}: {
  kind: keyof typeof LOGOS;
  tone: BrandTone;
  height?: number;
  width?: number;
  alt?: string;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  const ratio = LOGOS[kind].width / LOGOS[kind].height;
  const w = width ?? Math.round((height ?? 20) * ratio);
  const h = height ?? Math.round(w / ratio);
  const file = kind === "monogram" ? "monogramme" : "wordmark";
  return (
    <Image
      className={className}
      src={`/logos/${file}-${tone}.png`}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      preload={preload}
    />
  );
}
