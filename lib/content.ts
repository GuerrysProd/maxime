/**
 * Seule porte d’accès au contenu (SOURCES-REELLES §8) : les composants n’importent jamais
 * les JSON directement. Chaque fichier est validé (zod), passé à la typographie française
 * et ses images sont complétées par le manifeste. Une erreur de contenu fait échouer le build.
 */
import type { z } from "zod";
import faqFr from "@/content/fr/faq.json";
import homeFr from "@/content/fr/home.json";
import objectsFr from "@/content/fr/objects.json";
import projectsFr from "@/content/fr/projects.json";
import servicesFr from "@/content/fr/services.json";
import siteFr from "@/content/fr/site.json";
import uiFr from "@/content/fr/ui.json";
import { resolveImage, type ImageAsset } from "./media";
import {
  faqSchema,
  homeSchema,
  objectsSchema,
  projectsSchema,
  servicesSchema,
  siteSchema,
  uiSchema,
  type ObjectPiece,
  type Project,
} from "./schemas";
import { applyTypo, fill } from "./typo";

export type Locale = "fr";
export const defaultLocale: Locale = "fr";

const sources = {
  fr: { site: siteFr, home: homeFr, ui: uiFr, projects: projectsFr, objects: objectsFr, services: servicesFr, faq: faqFr },
} as const;

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
export const getProjects = (locale: Locale = defaultLocale) => load("projects", projectsSchema, locale);
export const getObjects = (locale: Locale = defaultLocale) => load("objects", objectsSchema, locale).items;
export const getServices = (locale: Locale = defaultLocale) => load("services", servicesSchema, locale);
export const getFaq = (locale: Locale = defaultLocale) => load("faq", faqSchema, locale).items;

export function getProject(slug: string, locale: Locale = defaultLocale): Project | undefined {
  return getProjects(locale).items.find((project) => project.slug === slug);
}

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

export type { Draft, FaqItem, Home, MediaItem, ObjectPiece, Project, ProjectInPreparation, Site, Ui } from "./schemas";
export type { ImageAsset } from "./media";
