#!/usr/bin/env node
/**
 * Captures de contrôle : chaque page du site et l’aperçu correspondant de la maquette,
 * à 1440 et 390 px, assemblés côte à côte (maquette à gauche, site à droite) dans
 * .captures/<etape>/. Le site est servi par `next start` (build requis).
 *
 *   npm run captures -- etape-2
 *   npm run captures -- etape-2 accueil,menu-mobile   (seulement ces pages)
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEWS = path.resolve(SITE_DIR, "..", "design", "previews");
const PORT = Number(process.env.PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;
const step = process.argv[2] ?? "etape";
const only = process.argv[3]?.split(",");
const OUT = path.join(SITE_DIR, ".captures", step);

/** Pages à capturer : chemin du site, aperçu desktop, aperçu mobile, action éventuelle. */
const PAGES = [
  { name: "accueil", path: "/", desktop: "01-accueil.html", mobile: "02-accueil-mobile.html" },
  { name: "accueil-hero-b", path: "/2", desktop: "01b-accueil-hero-b.html", mobile: null },
  { name: "menu-mobile", path: "/", desktop: null, mobile: "02b-menu-mobile.html", openMenu: true, viewportOnly: true },
  { name: "projets", path: "/projets", desktop: "05-projets.html", mobile: "05b-projets-mobile.html" },
  { name: "projets-index", path: "/projets?vue=index", desktop: null, mobile: null },
  { name: "projet-duplex-pralong", path: "/projets/duplex-pralong", desktop: "03-projet-duplex-pralong.html", mobile: null },
  { name: "projet-perchee", path: "/projets/perchee", desktop: null, mobile: null },
  { name: "projet-alta", path: "/projets/alta", desktop: null, mobile: null },
  { name: "projet-agora", path: "/projets/agora", desktop: null, mobile: null },
  { name: "projet-batiment-s", path: "/projets/batiment-s", desktop: null, mobile: null },
  { name: "projet-rolex-retail-express", path: "/projets/rolex-retail-express", desktop: null, mobile: null },
];

const VIEWPORTS = [
  { label: "1440", width: 1440, height: 900, key: "desktop", mobile: false },
  { label: "390", width: 390, height: 844, key: "mobile", mobile: true },
];

async function serverUp() {
  try {
    return (await fetch(BASE)).ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverUp()) return null;
  const child = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: SITE_DIR, stdio: "ignore" });
  for (let i = 0; i < 60; i += 1) {
    await new Promise((r) => setTimeout(r, 500));
    if (await serverUp()) return child;
  }
  child.kill();
  throw new Error(`Le serveur ne répond pas sur ${BASE} (lancer npm run build d’abord).`);
}

async function shoot(browser, url, viewport, { openMenu = false, viewportOnly = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    reducedMotion: "reduce",
    locale: "fr-FR",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // Défilement pour charger les images différées, puis retour en haut.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(400);
  if (openMenu) {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.waitForTimeout(400);
  }
  const buffer = await page.screenshot({ fullPage: !viewportOnly });
  await context.close();
  return buffer;
}

function label(text, width) {
  return Buffer.from(
    `<svg width="${width}" height="48" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#382B2B"/><text x="16" y="31" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#F5F0E8">${text}</text></svg>`,
  );
}

async function sideBySide(left, right, file, titles) {
  const [a, b] = await Promise.all([sharp(left).metadata(), sharp(right ?? left).metadata()]);
  const gap = 24;
  const width = a.width + (right ? gap + b.width : 0);
  const height = 48 + Math.max(a.height, right ? b.height : 0);
  const layers = [
    { input: label(titles[0], a.width), left: 0, top: 0 },
    { input: left, left: 0, top: 48 },
  ];
  if (right) {
    layers.push({ input: label(titles[1], b.width), left: a.width + gap, top: 0 });
    layers.push({ input: right, left: a.width + gap, top: 48 });
  }
  await sharp({ create: { width, height, channels: 3, background: "#D9D1C4" } })
    .composite(layers)
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(file);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch();
  const written = [];
  try {
    for (const entry of PAGES.filter((p) => !only || only.includes(p.name))) {
      for (const viewport of VIEWPORTS) {
        const preview = entry[viewport.key];
        if (entry.openMenu && !viewport.mobile) continue;
        const site = await shoot(browser, `${BASE}${entry.path}`, viewport, entry);
        const maquette = preview ? await shoot(browser, pathToFileURL(path.join(PREVIEWS, preview)).href, viewport, { viewportOnly: entry.viewportOnly }) : null;
        const file = path.join(OUT, `${entry.name}-${viewport.label}.jpg`);
        if (maquette) await sideBySide(maquette, site, file, [`Maquette — ${preview}`, `Site — ${entry.path}`]);
        else await sideBySide(site, null, file, [`Site — ${entry.path} (pas d’aperçu ${viewport.label} px dans la maquette)`]);
        written.push(path.relative(SITE_DIR, file));
        console.log(`✓ ${path.relative(SITE_DIR, file)}`);
      }
    }
  } finally {
    await browser.close();
    server?.kill();
  }
  await writeFile(path.join(OUT, "README.txt"), `Captures ${step} — maquette à gauche, site à droite.\n${written.join("\n")}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
