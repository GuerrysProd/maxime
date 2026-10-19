import { expect, test } from "@playwright/test";
import {
  getFaq,
  getHome,
  getObjects,
  getProjectDetail,
  getProjects,
  getServices,
  getSite,
  getUi,
  projectDetailSlugs,
} from "@/lib/content";

/** Tout le contenu se charge et passe la validation (zod, images présentes dans le manifeste). */
test("contenu valide", () => {
  expect(getSite().identity.name).toBeTruthy();
  expect(getHome().hero.image.width).toBeGreaterThan(0);
  expect(getUi().skipLink).toBeTruthy();
  expect(getServices().offers.length).toBeGreaterThan(0);
  expect(getFaq().length).toBeGreaterThan(0);
  expect(getObjects().length).toBeGreaterThan(0);

  const { items } = getProjects();
  for (const slug of projectDetailSlugs()) {
    const detail = getProjectDetail(slug);
    expect(detail?.chapters.length, slug).toBeGreaterThan(0);
    expect(items.some((project) => project.slug === slug), `${slug} absent de projects.json`).toBe(true);
    for (const chapter of detail!.chapters) {
      for (const block of chapter.blocks) {
        if (block.type === "feature" && block.object) {
          expect(getObjects().some((piece) => piece.slug === block.object), `${slug} → objet ${block.object}`).toBe(true);
        }
      }
    }
  }
});

/** Règles de contenu (brief §1, SOURCES-REELLES §2). */
test("règles de contenu : jamais « architecte » seul, pas de lauréat Design Parade", () => {
  const all = JSON.stringify([getSite(), getHome(), getProjects(), getObjects(), getServices(), getFaq(), ...projectDetailSlugs().map((s) => getProjectDetail(s))]);
  // Le titre de Maxime : « architecte » au singulier doit toujours être suivi de « d’intérieur ».
  // (Le pluriel désigne des clients — agences, architectes partenaires — et « Architecture » est permis.)
  const architecteSeul = all.match(/\barchitecte\b(?![\s\u00A0]d[’']intérieur)[^"]{0,30}/gi) ?? [];
  expect(architecteSeul).toEqual([]);
  expect(all).not.toMatch(/lauréat|sélectionné pour (la )?Design Parade/i);
});
