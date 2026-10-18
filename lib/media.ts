import manifest from "@/content/media-manifest.json";

/** Image prête pour next/image : dimensions et flou viennent du manifeste généré par `npm run images`. */
export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** object-position (ex. « 50% 55% ») */
  position?: string;
  positionMobile?: string;
}

interface ManifestEntry {
  width?: number;
  height?: number;
  blurDataURL?: string;
}

const images = manifest.images as Record<string, ManifestEntry>;

export function resolveImage(ref: { src: string; alt: string; position?: string; positionMobile?: string }): ImageAsset {
  const entry = images[ref.src];
  if (!entry?.width || !entry.height) {
    throw new Error(`Image absente du manifeste : ${ref.src}. Lancer « npm run images ».`);
  }
  return {
    src: ref.src,
    alt: ref.alt,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL,
    position: ref.position,
    positionMobile: ref.positionMobile,
  };
}
