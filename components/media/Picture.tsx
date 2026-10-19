import Image from "next/image";
import type { CSSProperties } from "react";
import type { ImageAsset } from "@/lib/content";

/**
 * Image remplissant son cadre (le cadre fixe le ratio). `parallax` décale l’image de ±x %
 * de la hauteur du cadre au défilement ; l’image est alors agrandie pour ne jamais laisser de vide.
 * `preload` : image prioritaire (hero, LCP) — chargement immédiat et priorité haute.
 */
export function Picture({
  image,
  sizes,
  alt,
  preload,
  parallax,
  parallaxMode,
  className,
  imageClassName,
  position,
}: {
  image: ImageAsset;
  sizes: string;
  alt?: string;
  preload?: boolean;
  parallax?: number;
  parallaxMode?: "top" | "center";
  className?: string;
  imageClassName?: string;
  position?: string;
}) {
  const objectPosition = position ?? image.position;
  // Cadrage propre au mobile (≤ 900 px) via une variable CSS (voir globals.css).
  const style = {
    objectFit: "cover",
    "--object-position": objectPosition ?? "50% 50%",
    ...(image.positionMobile ? { "--object-position-m": image.positionMobile } : {}),
  } as CSSProperties;
  const img = (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      loading={preload ? "eager" : undefined}
      fetchPriority={preload ? "high" : undefined}
      placeholder={image.blurDataURL ? "blur" : "empty"}
      blurDataURL={image.blurDataURL}
      className={[imageClassName, "picture"].filter(Boolean).join(" ")}
      data-position-m={image.positionMobile ? "" : undefined}
      style={style}
    />
  );
  if (!parallax) return img;

  const bleed = parallaxMode === "top" ? 0 : parallax * 100;
  const layer: CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: `${-bleed}%`,
    bottom: `${-bleed}%`,
  };
  return (
    // --parallax est écrit par MotionObserver, parfois avant l’hydratation.
    <div className={className} style={layer} data-parallax={parallax} data-parallax-mode={parallaxMode} suppressHydrationWarning>
      {img}
    </div>
  );
}
