import { z } from "zod";
import { resolveImage } from "./media";

/** Repère des contenus inconnus, laissé visible tant que Maxime n’a pas fourni l’info. */
export const PLACEHOLDER = /\[À COMPLÉTER/;

/**
 * Texte qui peut être un brouillon (`draft`) ou contenir un repère [À COMPLÉTER : …] (`missing`).
 * Dans le JSON : "texte" ou { "value": "texte", "draft": true }.
 */
export interface Draft {
  value: string;
  draft: boolean;
  missing: boolean;
}

export const draftable = z
  .union([z.string(), z.object({ value: z.string(), draft: z.boolean().optional() })])
  .transform((input): Draft => {
    const value = typeof input === "string" ? input : input.value;
    const draft = typeof input === "string" ? false : Boolean(input.draft);
    return { value, draft, missing: PLACEHOLDER.test(value) };
  });

export const imageRef = z
  .object({
    src: z.string().startsWith("/images/"),
    alt: z.string(),
    position: z.string().optional(),
    positionMobile: z.string().optional(),
  })
  .transform(resolveImage);

const link = z.object({ label: z.string(), href: z.string() });
const linkWithShort = link.extend({ labelShort: z.string().optional() });

/** Média de fiche : seule l’image est rendue aujourd’hui ; vidéo, séquence et 3D sont prévues (SOURCES §8). */
const poster = imageRef;
export const mediaItem = z.discriminatedUnion("type", [
  z
    .object({ type: z.literal("image"), src: z.string(), alt: z.string(), position: z.string().optional(), caption: z.string().optional() })
    .transform(({ type, caption, ...ref }) => ({ type, caption, image: resolveImage(ref) })),
  z.object({ type: z.literal("video"), src: z.string(), poster, caption: z.string().optional() }),
  z.object({ type: z.literal("sequence"), framesDir: z.string(), frameCount: z.number().int().positive(), poster, caption: z.string().optional() }),
  z.object({ type: z.literal("scene3d"), src: z.string(), poster, caption: z.string().optional() }),
]);
export type MediaItem = z.output<typeof mediaItem>;

/* ---------- Site ---------- */

const navItem = z.object({ id: z.string(), label: z.string(), href: z.string() });

export const siteSchema = z.object({
  identity: z.object({
    name: z.string(),
    title: z.string(),
    tagline: z.string(),
    taglineLines: z.array(z.string()),
    subtitle: z.string(),
    eyebrow: z.string(),
    eyebrowShort: z.string(),
    manifesto: z.string(),
    signature: z.string(),
    copyright: z.string(),
  }),
  contact: z.object({
    phone: z.object({ value: z.string(), href: z.string(), draft: z.boolean() }),
    email: z.object({ value: z.string(), href: z.string(), draft: z.boolean() }),
    address: draftable,
    region: z.string(),
    responseDelay: draftable,
    socials: z.array(z.object({ label: z.string(), href: z.string().nullable(), missing: z.string().optional() })),
  }),
  nav: z.array(navItem),
  menu: z.array(navItem.extend({ count: z.enum(["projects", "objects"]).optional() })),
  footerNav: z.array(navItem),
  legalNav: z.array(navItem),
  languages: z.array(z.object({ code: z.string(), label: z.string(), href: z.string().nullable() })),
  primaryCta: link,
  featured: z.object({ label: z.string(), project: z.string(), title: z.string(), image: imageRef }),
  ctaChips: z.array(z.object({ type: z.string(), label: z.string(), short: z.string() })),
  parcours: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string(),
      kind: z.string(),
      place: z.string(),
      detail: draftable.optional(),
      period: draftable,
      draft: z.boolean(),
    }),
  ),
  territories: z.array(
    z.object({ id: z.string(), name: z.string(), places: z.array(z.string()), text: z.string(), image: imageRef }),
  ),
});
export type Site = z.output<typeof siteSchema>;

/* ---------- Accueil ---------- */

const section = z.object({ number: z.string(), label: z.string() });

export const homeSchema = z.object({
  meta: z.object({ title: z.string(), description: z.string() }),
  hero: z.object({
    image: imageRef,
    caption: z.string(),
    projectsLink: linkWithShort,
    scroll: z.string(),
    indexTitle: z.string(),
    imageCaption: z.string(),
  }),
  manifesto: section.extend({ link }),
  projects: section.extend({
    title: z.string(),
    intro: z.string(),
    allLink: link,
    others: z.string(),
    scrollHint: z.string(),
    inPreparation: z.string(),
  }),
  objects: section.extend({ title: z.string(), intro: z.string(), link, noImage: z.string() }),
  services: section.extend({ title: z.string(), intro: z.string(), href: z.string() }),
  method: section.extend({ title: z.string(), intro: z.string() }),
  parcours: z.object({ label: z.string() }),
  territories: section.extend({ title: z.string() }),
  faq: section.extend({ title: z.string(), intro: z.string(), link }),
  cta: section.extend({
    title: z.string(),
    intro: z.string(),
    chipsLabel: z.string(),
    callPrefix: z.string(),
    frieze: z.array(z.string()),
  }),
});
export type Home = z.output<typeof homeSchema>;

/* ---------- Projets ---------- */

export const projectStatus = z.enum(["realisation", "etude", "concours", "perso", "diplome", "preparation"]);
export type ProjectStatus = z.output<typeof projectStatus>;

export const categoryId = z.enum(["residentiel", "hospitalite-commerce", "lieux-collectifs", "paysage", "objets"]);
export type CategoryId = z.output<typeof categoryId>;

export const projectSchema = z.object({
  slug: z.string(),
  number: z.string(),
  name: z.string(),
  shortName: z.string(),
  place: z.string(),
  placeShort: z.string().optional(),
  region: z.enum(["Alpes", "Méditerranée"]).nullable(),
  categories: z.array(categoryId),
  meta: z.array(draftable),
  /** Version courte pour les cartes compactes (mobile). */
  metaShort: z.array(draftable),
  summary: z.string(),
  disclaimer: z.string().optional(),
  status: z.object({ value: projectStatus, draft: z.boolean() }),
  cover: imageRef,
  hero: imageRef,
  template: z.enum(["chapitres", "modules"]),
  pieces: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
});
export type Project = z.output<typeof projectSchema>;

export const projectsSchema = z.object({
  categories: z.array(z.object({ id: categoryId, label: z.string() })),
  statusLabels: z.record(projectStatus, z.string()),
  items: z.array(projectSchema),
  inPreparation: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      place: draftable,
      note: draftable.optional(),
      cover: imageRef.nullable(),
    }),
  ),
});
export type Projects = z.output<typeof projectsSchema>;
export type ProjectInPreparation = Projects["inPreparation"][number];

/* ---------- Fiche projet (gabarit « chapitres ») ---------- */

/** Image de contenu avec légende facultative. */
export const figure = z
  .object({
    src: z.string().startsWith("/images/"),
    alt: z.string(),
    position: z.string().optional(),
    caption: z.string().optional(),
    /** « contain » pour un croquis ou un plan (fond clair, pas de recadrage). */
    fit: z.enum(["cover", "contain"]).optional(),
  })
  .transform(({ caption, fit, ...ref }) => ({ image: resolveImage(ref), caption, fit: fit ?? "cover" }));
export type Figure = z.output<typeof figure>;

const paragraphs = z.array(z.string());
const zoneCopy = z.object({ label: z.string(), title: z.string(), text: z.string() });

/** Blocs d’un chapitre, dans l’ordre d’affichage. */
export const chapterBlock = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), paragraphs }),
  z.object({
    type: z.literal("media"),
    layout: z.enum(["full", "wide", "duo", "portrait"]),
    items: z.array(figure).min(1),
  }),
  z.object({
    type: z.literal("beforeAfter"),
    before: figure,
    after: figure,
    initial: z.number().min(0).max(100).default(50),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal("feature"),
    number: z.string().optional(),
    label: z.string(),
    title: z.string(),
    paragraphs,
    media: z.array(figure),
    layout: z.enum(["media-left", "media-right", "stacked"]),
    /** Pièce de la rubrique Objets décrite par ce bloc. */
    object: z.string().optional(),
  }),
  z.object({
    type: z.literal("pair"),
    items: z.array(z.object({ title: z.string(), paragraphs, media: figure })).length(2),
  }),
  z.object({
    type: z.literal("palette"),
    items: z.array(z.object({ name: z.string(), color: z.string() })),
    note: draftable,
  }),
  z.object({ type: z.literal("quote"), text: z.string(), author: z.string(), draft: z.boolean() }),
  z.object({ type: z.literal("list"), items: z.array(z.object({ title: z.string(), text: z.string() })) }),
  z.object({
    type: z.literal("zoning"),
    /** Bâtiment fermé (état initial) et ouvert (pointeur sur le bâtiment, hors des pôles). */
    closed: imageRef,
    open: imageRef,
    overview: zoneCopy,
    openState: zoneCopy,
    zones: z
      .array(
        zoneCopy.extend({
          id: z.string(),
          layer: imageRef,
          /** Placement du calque s’il ne couvre pas toute la scène (en % de la scène). */
          box: z.object({ left: z.number(), top: z.number(), width: z.number() }).optional(),
        }),
      )
      .min(1),
  }),
  z.object({ type: z.literal("download"), label: z.string(), href: z.string(), meta: z.string().optional() }),
]);
export type ChapterBlock = z.output<typeof chapterBlock>;

export const chapterSchema = z.object({
  id: z.string(),
  /** Libellé court : sommaire et surtitre « 01 — Le projet ». */
  label: z.string(),
  /** Surtitre propre au chapitre, s’il diffère du libellé. */
  kicker: z.string().optional(),
  title: z.string(),
  blocks: z.array(chapterBlock),
});
export type Chapter = z.output<typeof chapterSchema>;

const specRow = z.union([
  z.object({ label: z.string(), status: z.literal(true) }),
  z.object({ label: z.string(), value: draftable }),
]);

export const projectDetailSchema = z.object({
  slug: z.string(),
  _note: z.string().optional(),
  /** Phrase d’ouverture (serif) ; par défaut, le résumé du projet. */
  lead: z.string().optional(),
  intro: paragraphs.optional(),
  specs: z.array(specRow),
  chapters: z.array(chapterSchema).min(1),
  /** Lien d’appel en bas du sommaire (« Un projet similaire ? »). */
  similar: z.object({ label: z.string(), type: z.string() }).optional(),
});
export type ProjectDetail = z.output<typeof projectDetailSchema>;
export type SpecRow = ProjectDetail["specs"][number];

/* ---------- Objets ---------- */

export const objectSchema = z.object({
  slug: z.string(),
  number: z.string(),
  name: z.string(),
  category: z.enum(["Luminaire", "Mobilier", "Objet"]),
  type: z.string(),
  tagline: z.string().optional(),
  materials: draftable,
  dimensions: draftable.optional(),
  light: draftable.optional(),
  edition: draftable.optional(),
  project: z.string().nullable(),
  projectMissing: z.string().optional(),
  extraSpecs: z.array(z.object({ label: z.string(), value: draftable })).optional(),
  media: z.array(mediaItem).min(1),
  sketch: imageRef.optional(),
  /** Vue de la pièce dans son lieu (sinon : image principale du projet d’origine). */
  inSitu: figure.optional(),
  summary: z.string().optional(),
  storyTitle: z.string().optional(),
  story: z.array(z.string()).optional(),
});
export type ObjectPiece = z.output<typeof objectSchema>;

export const objectsSchema = z.object({ items: z.array(objectSchema) });

/* ---------- Services, méthode, FAQ ---------- */

export const servicesSchema = z.object({
  offers: z.array(
    z.object({
      id: z.string(),
      number: z.string(),
      title: z.string(),
      summary: z.string(),
      audience: z.array(z.string()),
      deliverables: z.array(z.string()),
      image: imageRef,
    }),
  ),
  method: z.array(z.object({ number: z.string(), title: z.string(), text: z.string(), deliverable: z.string() })),
});
export type Services = z.output<typeof servicesSchema>;

export const faqSchema = z.object({
  items: z.array(z.object({ q: z.string(), a: z.string(), home: z.boolean() })),
});
export type FaqItem = z.output<typeof faqSchema>["items"][number];

/* ---------- Pages de rubrique ---------- */

const pageMeta = z.object({ title: z.string(), description: z.string() });

export const pagesSchema = z.object({
  _note: z.string().optional(),
  projects: z.object({ meta: pageMeta, eyebrow: z.string(), title: z.string(), intro: z.string(), counts: z.string() }),
  cta: z.object({ intro: z.string() }),
  objects: z.object({
    meta: pageMeta,
    eyebrow: z.string(),
    title: z.string(),
    intro: z.string(),
    viewPiece: z.string(),
    editors: z.object({ label: z.string(), title: z.string(), text: z.string(), cta: link, link }),
  }),
  object: z.object({
    position: z.string(),
    back: z.string(),
    request: z.string(),
    viewProject: z.string(),
    story: z.string(),
    sketchTitle: z.string(),
    sketchMeta: z.string(),
    sketchCaption: z.string(),
    pieceCaption: z.string(),
    galleryTitle: z.string(),
    inSitu: z.string(),
    others: z.string(),
    allObjects: z.string(),
    specs: z.object({ materials: z.string(), dimensions: z.string(), light: z.string(), edition: z.string(), project: z.string() }),
    custom: z.object({ label: z.string(), title: z.string() }),
  }),
});
export type Pages = z.output<typeof pagesSchema>;

/* ---------- Dictionnaire d’interface ---------- */

export const uiSchema = z.object({
  skipLink: z.string(),
  homeLabel: z.string(),
  mainNav: z.string(),
  footerNav: z.string(),
  legalNav: z.string(),
  language: z.string(),
  languageSoon: z.string(),
  openMenu: z.string(),
  closeMenu: z.string(),
  menu: z.string(),
  call: z.string(),
  explore: z.string(),
  contact: z.string(),
  follow: z.string(),
  backToTop: z.string(),
  projectsCount: z.object({ one: z.string(), other: z.string() }),
  draftNote: z.string(),
  missingLink: z.string(),
  frieze: z.string(),
  friezePause: z.string(),
  friezePlay: z.string(),
  quickActions: z.string(),
  allProjects: z.string(),
  projectPosition: z.string(),
  specSheet: z.string(),
  chapters: z.string(),
  chaptersNav: z.string(),
  nextProject: z.string(),
  viewProject: z.string(),
  viewObject: z.string(),
  piecesLabel: z.string(),
  piecesTitle: z.string(),
  allObjects: z.string(),
  beforeAfter: z.object({ label: z.string(), valueText: z.string(), hint: z.string(), before: z.string(), after: z.string() }),
  zoning: z.object({ stage: z.string(), hint: z.string(), zones: z.string(), reset: z.string() }),
  filters: z.object({
    group: z.string(),
    all: z.string(),
    views: z.string(),
    grid: z.string(),
    list: z.string(),
    columns: z.object({ number: z.string(), project: z.string(), category: z.string(), place: z.string(), status: z.string() }),
  }),
  inPreparation: z.string(),
});
export type Ui = z.output<typeof uiSchema>;
