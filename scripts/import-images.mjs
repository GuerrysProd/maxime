#!/usr/bin/env node
/**
 * Importe dans public/images/ les images référencées par le contenu, à partir des
 * originaux de ../images-par-projet/ (SOURCES-REELLES §3), et écrit
 * content/media-manifest.json (dimensions + flou de chargement) pour next/image.
 *
 *   npm run images              traite ce qui manque ou a changé
 *   npm run images -- --force   retraite tout
 *   npm run images -- --prune   supprime aussi les fichiers devenus inutiles
 *
 * Conventions :
 *   images-par-projet/<NN-dossier>/<sous-dossiers>/<Nom Fichier>.<ext>
 *     → public/images/<destination du dossier>/<sous-dossiers>/<nom-fichier>.<jpg|png>
 *   - rendus photo (même en PNG opaque) → JPEG q85, 2560 px max, sRGB ;
 *   - plans, schémas, croquis, calques et PNG transparents → PNG (transparence conservée) ;
 *   - autres fichiers (PDF) → copiés tels quels.
 * Relançable : un fichier n’est retraité que si l’original ou les réglages changent.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(process.env.IMAGES_SRC ?? path.join(SITE_DIR, "..", "images-par-projet"));
const PUBLIC_DIR = path.join(SITE_DIR, "public");
const CONTENT_DIR = path.join(SITE_DIR, "content");
const MANIFEST = path.join(CONTENT_DIR, "media-manifest.json");
const MONOGRAM = path.join(PUBLIC_DIR, "logos", "monogramme-cacao.png");

const SETTINGS = {
  version: 1,
  maxSide: 2560,
  jpegQuality: 85,
  blurWidth: 16,
  iconBackground: "#F5F0E8",
};
const SETTINGS_HASH = hash(JSON.stringify(SETTINGS)).slice(0, 8);

const FOLDERS = {
  "00-identite": null,
  "01-perchee": "projets/perchee",
  "02-duplex-pralong": "projets/duplex-pralong",
  "03-alta": "projets/alta",
  "04-rolex-retail-express": "projets/rolex-retail-express",
  "05-agora": "projets/agora",
  "06-chateau-gasqui": "projets/chateau-gasqui",
  "07-batiment-s": "projets/batiment-s",
  "08-clocher-saint-louis": "projets/clocher-saint-louis",
  "09-projet-dionys": "projets/projet-dionys",
  "10-page-blanche": "projets/page-blanche",
  "11-lampe-spotlight": "objets/lampe-spotlight",
  "12-seau-roche-ruinart": "objets/seau-roche-ruinart",
  "99-divers": null,
};

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const DRAWING = /(^|[-_ /])(plan|plans|croquis|zoning|document|iso|structure|layers|schema|coupe)([-_ ./]|$)/i;

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const PRUNE = args.has("--prune");

function hash(data) {
  return createHash("sha1").update(data).digest("hex");
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Index des originaux : chemin public candidat → original. */
async function indexOriginals() {
  const index = new Map();
  for (const file of await walk(SRC_DIR)) {
    const rel = path.relative(SRC_DIR, file);
    const [folder, ...rest] = rel.split(path.sep);
    const dest = FOLDERS[folder];
    if (dest === undefined) throw new Error(`Dossier inconnu dans images-par-projet : ${folder}`);
    if (dest === null) continue;
    const ext = path.extname(rest.at(-1)).toLowerCase();
    const dirs = rest.slice(0, -1).map(slugify);
    const base = slugify(path.basename(rest.at(-1), path.extname(rest.at(-1))));
    // Les images sont indexées sans extension (le format de sortie dépend du type),
    // les autres fichiers (PDF) avec leur extension.
    const key = ["/images", dest, ...dirs, base].join("/") + (RASTER.has(ext) ? "" : ext);
    if (index.has(key)) throw new Error(`Deux originaux donnent le même nom : ${rel} et ${index.get(key).rel}`);
    index.set(key, { file, rel, ext });
  }
  return index;
}

/** Chemins /images/… cités dans content/**\/*.json (hors manifeste). */
async function referencedPaths() {
  const refs = new Map();
  for (const file of await walk(CONTENT_DIR)) {
    if (!file.endsWith(".json") || file === MANIFEST) continue;
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/"(\/images\/[^"]+)"/g)) {
      if (!refs.has(match[1])) refs.set(match[1], path.relative(SITE_DIR, file));
    }
  }
  return refs;
}

async function classify(original) {
  if (!RASTER.has(original.ext)) return "file";
  if (DRAWING.test(original.rel)) return "drawing";
  if (original.ext === ".png" || original.ext === ".webp" || original.ext === ".tif" || original.ext === ".tiff") {
    const { isOpaque } = await sharp(original.file).stats();
    if (!isOpaque) return "transparent";
  }
  return "photo";
}

function expectedExt(kind, original) {
  if (kind === "file") return original.ext;
  if (kind === "photo") return ".jpg";
  if (kind === "drawing" && (original.ext === ".jpg" || original.ext === ".jpeg")) return ".jpg";
  return ".png";
}

async function render(kind, original, target) {
  await mkdir(path.dirname(target), { recursive: true });
  if (kind === "file") {
    await copyFile(original.file, target);
    return;
  }
  const base = sharp(original.file, { failOn: "none" })
    .rotate()
    .resize({ width: SETTINGS.maxSide, height: SETTINGS.maxSide, fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .withIccProfile("srgb");
  if (target.endsWith(".jpg")) {
    await base
      .flatten({ background: "#FFFFFF" })
      .jpeg({ quality: kind === "photo" ? SETTINGS.jpegQuality : 90, mozjpeg: true })
      .toFile(target);
  } else {
    await base.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
  }
}

async function describe(target) {
  const meta = await sharp(target).metadata();
  const blur = await sharp(target).resize({ width: SETTINGS.blurWidth }).webp({ quality: 40 }).toBuffer();
  return {
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

async function generateIcons(previous) {
  const source = await readFile(MONOGRAM);
  const sourceHash = `${hash(source)}-${SETTINGS_HASH}`;
  const icons = [
    { file: path.join(SITE_DIR, "app", "icon.png"), size: 512 },
    { file: path.join(SITE_DIR, "app", "apple-icon.png"), size: 180 },
  ];
  if (!FORCE && previous === sourceHash && icons.every((icon) => existsSync(icon.file))) return { hash: sourceHash, written: 0 };
  for (const icon of icons) {
    const mark = await sharp(source)
      .resize({ width: Math.round(icon.size * 0.84), height: Math.round(icon.size * 0.84), fit: "inside" })
      .toBuffer();
    await sharp({ create: { width: icon.size, height: icon.size, channels: 4, background: SETTINGS.iconBackground } })
      .composite([{ input: mark, gravity: "center" }])
      .png({ compressionLevel: 9 })
      .toFile(icon.file);
  }
  return { hash: sourceHash, written: icons.length };
}

async function main() {
  if (!existsSync(SRC_DIR)) throw new Error(`Originaux introuvables : ${SRC_DIR} (variable IMAGES_SRC pour un autre emplacement)`);

  const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : { images: {} };
  const index = await indexOriginals();
  const refs = await referencedPaths();

  const errors = [];
  const images = {};
  let written = 0;
  let kept = 0;

  for (const [publicPath, citedIn] of [...refs].sort(([a], [b]) => a.localeCompare(b))) {
    const stem = publicPath.replace(/\.[a-z0-9]+$/i, "");
    const original = index.get(publicPath) ?? index.get(stem);
    if (!original) {
      errors.push(`${publicPath} (cité dans ${citedIn}) : aucun original ne correspond.`);
      continue;
    }
    const kind = await classify(original);
    const ext = expectedExt(kind, original);
    if (!publicPath.endsWith(ext)) {
      errors.push(`${publicPath} (cité dans ${citedIn}) : l’original ${original.rel} est un ${kind}, le chemin attendu est ${stem}${ext}.`);
      continue;
    }

    const sourceHash = `${hash(await readFile(original.file))}-${SETTINGS_HASH}`;
    const target = path.join(PUBLIC_DIR, publicPath);
    const before = previous.images?.[publicPath];
    if (!FORCE && before?.sourceHash === sourceHash && existsSync(target)) {
      images[publicPath] = before;
      kept += 1;
      continue;
    }
    await render(kind, original, target);
    const info = kind === "file" ? {} : await describe(target);
    images[publicPath] = { ...info, kind, source: original.rel, sourceHash };
    written += 1;
    console.log(`✓ ${original.rel} → ${publicPath}`);
  }

  if (errors.length) {
    console.error(`\n${errors.length} image(s) introuvable(s) :\n- ${errors.join("\n- ")}`);
    process.exitCode = 1;
    return;
  }

  // Fichiers de public/images qui ne sont plus référencés.
  const imagesDir = path.join(PUBLIC_DIR, "images");
  const orphans = existsSync(imagesDir)
    ? (await walk(imagesDir)).map((f) => `/${path.relative(PUBLIC_DIR, f).split(path.sep).join("/")}`).filter((p) => !images[p])
    : [];
  for (const orphan of orphans) {
    if (PRUNE) await rm(path.join(PUBLIC_DIR, orphan));
    console.log(`${PRUNE ? "✗ supprimé" : "· inutilisé (--prune pour supprimer)"} ${orphan}`);
  }

  const icons = await generateIcons(previous.icons);

  const manifest = { _note: "Généré par scripts/import-images.mjs — ne pas modifier à la main.", icons: icons.hash, images };
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n${written} image(s) écrite(s), ${kept} inchangée(s), ${icons.written} icône(s) générée(s), ${orphans.length} inutilisée(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
