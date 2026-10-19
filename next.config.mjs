// En JavaScript (et non TypeScript) : sur l’hébergement, seul le compilateur WASM de Next
// fonctionne (GLIBC trop ancienne pour le binaire natif) et il ne sait pas charger next.config.ts.

/** Anciennes adresses du site actuel → nouvelles (SOURCES-REELLES §7), en 301. */
const LEGACY_REDIRECTS = [
  ["/index.html", "/"],
  ["/perchee.html", "/projets/perchee"],
  ["/pralong.html", "/projets/duplex-pralong"],
  ["/alta.html", "/projets/alta"],
  ["/rolex.html", "/projets/rolex-retail-express"],
  ["/agora.html", "/projets/agora"],
  ["/gasqui.html", "/projets/chateau-gasqui"],
  ["/batiment-s.html", "/projets/batiment-s"],
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Pièces jointes du formulaire de contact : 4 Mo au total (lib/contact/validate.ts).
    serverActions: { bodySizeLimit: "5mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map(([source, destination]) => ({ source, destination, statusCode: 301 }));
  },
};

export default nextConfig;
