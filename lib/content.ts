/**
 * Seule porte d’accès au contenu (SOURCES-REELLES §8) : les composants n’importent jamais
 * les JSON directement. Chaque fichier est validé (zod), passé à la typographie française
 * et ses images sont complétées par le manifeste. Une erreur de contenu fait échouer le build.
 */
import type { z } from "zod";
import contactFr from "@/content/fr/contact.json";
import faqFr from "@/content/fr/faq.json";
import homeFr from "@/content/fr/home.json";
import objectsFr from "@/content/fr/objects.json";
import pagesFr from "@/content/fr/pages.json";
import projectsFr from "@/content/fr/projects.json";
import agoraFr from "@/content/fr/projects/agora.json";
import altaFr from "@/content/fr/projects/alta.json";
import batimentSFr from "@/content/fr/projects/batiment-s.json";
import pralongFr from "@/content/fr/projects/duplex-pralong.json";
import percheeFr from "@/content/fr/projects/perchee.json";
import rolexFr from "@/content/fr/projects/rolex-retail-express.json";
import servicesFr from "@/content/fr/services.json";
import siteFr from "@/content/fr/site.json";
import studioFr from "@/content/fr/studio.json";
import uiFr from "@/content/fr/ui.json";
import { resolveImage, type ImageAsset } from "./media";
import {
  contactSchema,
  faqSchema,
  homeSchema,
  objectsSchema,
  pagesSchema,
  projectDetailSchema,
  projectsSchema,
  servicesSchema,
  siteSchema,
  studioSchema,
  uiSchema,
  type ObjectPiece,
  type Project,
  type ProjectDetail,
} from "./schemas";
import { applyTypo, fill } from "./typo";

export type Locale = "fr";
export const defaultLocale: Locale = "fr";

const sources = {
  fr: { site: siteFr, home: homeFr, ui: uiFr, pages: pagesFr, studio: studioFr, contact: contactFr, projects: projectsFr, objects: objectsFr, services: servicesFr, faq: faqFr },
} as const;

/** Fiches détaillées (gabarit « chapitres »), une par projet. */
const details: Record<Locale, Record<string, unknown>> = {
  fr: {
    "duplex-pralong": pralongFr,
    perchee: percheeFr,
    alta: altaFr,
    agora: agoraFr,
    "batiment-s": batimentSFr,
    "rolex-retail-express": rolexFr,
  },
};

type SourceName = keyof (typeof sources)["fr"];
const cache = new Map<string, unknown>();

function load<S extends z.ZodType>(name: SourceName, schema: S, locale: Locale): z.output<S> {
  const key = `${locale}:${name}`;
  if (!cache.has(key)) {
    const parsed = schema.safeParse(applyTypo(sources[locale][name]));
    if (!parsed.success) {
      throw new Error(`Contenu invalide (content/${locale}/${name}.json) :\n${parsed.error.message}`);
    }
    cache.set(key, parsed.data);
  }
  return cache.get(key) as z.output<S>;
}

export const getSite = (locale: Locale = defaultLocale) => load("site", siteSchema, locale);
export const getHome = (locale: Locale = defaultLocale) => load("home", homeSchema, locale);
export const getUi = (locale: Locale = defaultLocale) => load("ui", uiSchema, locale);
export const getPages = (locale: Locale = defaultLocale) => load("pages", pagesSchema, locale);
export const getStudio = (locale: Locale = defaultLocale) => load("studio", studioSchema, locale);
export const getContact = (locale: Locale = defaultLocale) => load("contact", contactSchema, locale);
export const getProjects = (locale: Locale = defaultLocale) => load("projects", projectsSchema, locale);
export const getObjects = (locale: Locale = defaultLocale) => load("objects", objectsSchema, locale).items;
export const getServices = (locale: Locale = defaultLocale) => load("services", servicesSchema, locale);
export const getFaq = (locale: Locale = defaultLocale) => load("faq", faqSchema, locale).items;

export function getProject(slug: string, locale: Locale = defaultLocale): Project | undefined {
  return getProjects(locale).items.find((project) => project.slug === slug);
}

/** Fiche détaillée d’un projet, ou undefined si elle n’existe pas encore. */
export function getProjectDetail(slug: string, locale: Locale = defaultLocale): ProjectDetail | undefined {
  const key = `${locale}:detail:${slug}`;
  if (!cache.has(key)) {
    const source = details[locale][slug];
    if (!source) return undefined;
    const parsed = projectDetailSchema.safeParse(applyTypo(source));
    if (!parsed.success) {
      throw new Error(`Contenu invalide (content/${locale}/projects/${slug}.json) :\n${parsed.error.message}`);
    }
    cache.set(key, parsed.data);
  }
  return cache.get(key) as ProjectDetail;
}

/** Slugs des projets qui ont une fiche (pages générées). */
export const projectDetailSlugs = (locale: Locale = defaultLocale) => Object.keys(details[locale]);

export function getObject(slug: string, locale: Locale = defaultLocale): ObjectPiece | undefined {
  return getObjects(locale).find((piece) => piece.slug === slug);
}

/** Image décorative (frise, aperçus) : texte alternatif vide. */
export function getDecorativeImage(src: string): ImageAsset {
  return resolveImage({ src, alt: "" });
}

/** Libellé de statut d’un projet. */
export function statusLabel(status: Project["status"]["value"], locale: Locale = defaultLocale): string {
  return getProjects(locale).statusLabels[status] ?? status;
}

/** « 7 projets », « 1 projet ». */
export function projectsCount(n: number, locale: Locale = defaultLocale): string {
  const { projectsCount: forms } = getUi(locale);
  return fill(n > 1 ? forms.other : forms.one, { n: String(n).padStart(2, "0") });
}

export const projectHref = (slug: string) => `/projets/${slug}`;
export const objectHref = (slug: string) => `/objets/${slug}`;
export const contactHref = (type?: string) => (type ? `/contact?type=${encodeURIComponent(type)}` : "/contact");

export type {
  Chapter,
  Contact,
  ChapterBlock,
  Draft,
  FaqItem,
  Figure,
  Home,
  MediaItem,
  ObjectPiece,
  Pages,
  Project,
  ProjectDetail,
  ProjectInPreparation,
  Services,
  Site,
  SpecRow,
  Studio,
  Ui,
} from "./schemas";
export type { ImageAsset } from "./media";
